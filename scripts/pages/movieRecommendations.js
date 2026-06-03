import { getApiReadKey } from '../api/constants.js'
import { TMDb } from '../api/tmdb.js'

// Configurações básicas da tela de recomendações.
const MOVIES_PER_PAGE = 30
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342'
const CURRENT_YEAR = new Date().getFullYear()

const tmdb = new TMDb(await getApiReadKey())

// Elementos principais manipulados pelo script.
const genresGrid = document.querySelector('#genresGrid')
const genresToggle = document.querySelector('#genresToggle')
const genresToggleIcon = document.querySelector('#genresToggleIcon')
const selectedTags = document.querySelector('#selectedTags')
const moviesGrid = document.querySelector('#moviesGrid')
const pagination = document.querySelector('#pagination')
const status = document.querySelector('#status')
const resultsTitle = document.querySelector('#resultsTitle')
const sortToggle = document.querySelector('#sortToggle')
const sortMenu = document.querySelector('#sortMenu')
const sortLabel = document.querySelector('#sortLabel')

// Mapeia as opções visíveis de ordenação para os parâmetros do TMDB.
const SORT_OPTIONS = {
  rating: {
    label: 'Nota',
    sortBy: 'vote_average.desc',
  },
  popularity: {
    label: 'Popularidade',
    sortBy: 'popularity.desc',
  },
  releaseYear: {
    label: 'Ano de lançamento',
    sortBy: 'primary_release_date.desc',
    onlyReleased: true,
  },
}

// Estado atual dos filtros, paginação e ordenação.
let genres = []
let selectedGenreIds = []
let currentPage = 1
let latestRequestId = 0
let currentSort = 'rating'

function getGenreName(id) {
  return genres.find((genre) => genre.id === Number(id))?.name || 'Genero'
}

function getMovieGenres(movie) {
  return genres.filter((genre) => movie.genre_ids?.includes(genre.id))
}

// Remove filmes sem ano de lançamento ou sem nota válida.
function hasRequiredMovieData(movie) {
  const releaseYear = Number(movie.release_date?.slice(0, 4))
  return Number.isInteger(releaseYear) && Number(movie.vote_average) > 0
}

// Renderiza os checkboxes de gênero recebidos da API.
function renderGenres() {
  genresGrid.innerHTML = ''

  genres.forEach((genre) => {
    const label = document.createElement('label')
    label.className = 'genre-option'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.value = genre.id
    checkbox.checked = selectedGenreIds.includes(String(genre.id))

    const text = document.createElement('span')
    text.textContent = genre.name

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedGenreIds = [...selectedGenreIds, checkbox.value]
      } else {
        selectedGenreIds = selectedGenreIds.filter((id) => id !== checkbox.value)
      }

      currentPage = 1
      renderSelectedTags()
      loadMovies()
    })

    label.append(checkbox, text)
    genresGrid.appendChild(label)
  })
}

// Alterna a visibilidade da lista de gêneros.
function initGenresToggle() {
  genresToggle.addEventListener('click', () => {
    const isExpanded = genresToggle.getAttribute('aria-expanded') === 'true'
    genresToggle.setAttribute('aria-expanded', String(!isExpanded))
    genresToggle.setAttribute(
      'aria-label',
      isExpanded ? 'Mostrar gêneros' : 'Ocultar gêneros'
    )
    genresToggleIcon.textContent = isExpanded ? 'v' : '^'
    genresGrid.classList.toggle('is-collapsed', isExpanded)
  })
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

// Atualiza o destaque visual da opção de ordenação ativa.
function renderSortMenu() {
  sortMenu.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.sort === currentSort)
  })
}

function closeSortMenu() {
  sortToggle.setAttribute('aria-expanded', 'false')
  sortMenu.classList.add('hidden')
}

// Controla o menu de ordenação e recarrega os filmes ao trocar o critério.
function initSortControl() {
  sortToggle.addEventListener('click', () => {
    const isExpanded = sortToggle.getAttribute('aria-expanded') === 'true'
    sortToggle.setAttribute('aria-expanded', String(!isExpanded))
    sortMenu.classList.toggle('hidden', isExpanded)
  })

  sortMenu.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-sort]')
    if (!button) return

    currentSort = button.dataset.sort
    currentPage = 1
    sortLabel.textContent = SORT_OPTIONS[currentSort].label
    renderSortMenu()
    closeSortMenu()
    loadMovies()
  })

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.sort-control')) closeSortMenu()
  })

  renderSortMenu()
}

// Renderiza as badges dos gêneros selecionados.
function renderSelectedTags() {
  selectedTags.innerHTML = ''

  if (selectedGenreIds.length === 0) {
    const empty = document.createElement('span')
    empty.className = 'eyebrow'
    empty.textContent = 'Nenhum gênero selecionado'
    selectedTags.appendChild(empty)
    resultsTitle.textContent = 'Todos os filmes'
    return
  }

  resultsTitle.textContent = 'Recomendações por gênero'

  selectedGenreIds.forEach((id) => {
    const badge = document.createElement('span')
    badge.className = 'tag-badge'
    badge.textContent = getGenreName(id)

    const removeButton = document.createElement('button')
    removeButton.type = 'button'
    removeButton.setAttribute('aria-label', `Remover ${getGenreName(id)}`)
    removeButton.textContent = 'x'
    removeButton.addEventListener('click', () => removeGenre(id))

    badge.appendChild(removeButton)
    selectedTags.appendChild(badge)
  })
}

// Remove uma tag selecionada e refaz a busca.
function removeGenre(id) {
  selectedGenreIds = selectedGenreIds.filter((genreId) => genreId !== String(id))
  currentPage = 1
  renderGenres()
  renderSelectedTags()
  loadMovies()
}

function setLoading(message = 'Carregando filmes...') {
  status.textContent = message
  moviesGrid.innerHTML = ''
  pagination.innerHTML = ''
}

// Monta o card compacto com poster, título, ano, nota e gêneros.
function createMovieCard(movie) {
  const card = document.createElement('article')
  card.className = 'movie-card'
  const releaseYear = Number(movie.release_date?.slice(0, 4))

  if (releaseYear === CURRENT_YEAR) {
    card.classList.add('is-new')

    const newBadge = document.createElement('span')
    newBadge.className = 'new-badge'
    newBadge.textContent = 'novo'
    card.appendChild(newBadge)
  }

  if (movie.poster_path) {
    const poster = document.createElement('img')
    poster.className = 'movie-poster'
    poster.src = `${IMAGE_BASE_URL}${movie.poster_path}`
    poster.alt = `Poster de ${movie.title}`
    card.appendChild(poster)
  } else {
    const placeholder = document.createElement('div')
    placeholder.className = 'movie-placeholder'
    placeholder.textContent = 'Sem poster'
    card.appendChild(placeholder)
  }

  const content = document.createElement('div')
  content.className = 'movie-content'

  const title = document.createElement('h3')
  title.className = 'movie-title'
  title.textContent = movie.title || 'Titulo indisponivel'

  const meta = document.createElement('div')
  meta.className = 'movie-meta'

  const year = document.createElement('span')
  year.textContent = movie.release_date?.slice(0, 4) || '----'

  const rating = document.createElement('span')
  rating.className = 'movie-rating'
  rating.textContent = `Nota ${movie.vote_average ? movie.vote_average.toFixed(1) : '--'}`

  const genresContainer = document.createElement('div')
  genresContainer.className = 'movie-genres'

  getMovieGenres(movie)
    .slice(0, 3)
    .forEach((genre) => {
      const genreTag = document.createElement('span')
      genreTag.className = 'movie-genre'
      genreTag.textContent = genre.name
      genresContainer.appendChild(genreTag)
    })

  meta.append(year, rating)
  content.append(title, meta, genresContainer)
  card.appendChild(content)
  return card
}

// Atualiza a grade de resultados.
function renderMovies(movies) {
  moviesGrid.innerHTML = ''

  if (movies.length === 0) {
    status.textContent = 'Nenhum filme encontrado para os gêneros selecionados.'
    return
  }

  status.textContent = `${movies.length} filmes nesta pagina`
  movies.forEach((movie) => moviesGrid.appendChild(createMovieCard(movie)))
}

// Cria os controles de paginação com janela curta de páginas.
function renderPagination(totalMovies) {
  pagination.innerHTML = ''

  const totalPages = Math.max(1, Math.ceil(totalMovies / MOVIES_PER_PAGE))
  const pageWindow = 7
  const start = Math.max(1, currentPage - Math.floor(pageWindow / 2))
  const end = Math.min(totalPages, start + pageWindow - 1)

  const previous = document.createElement('button')
  previous.type = 'button'
  previous.textContent = '<'
  previous.disabled = currentPage === 1
  previous.setAttribute('aria-label', 'Pagina anterior')
  previous.addEventListener('click', () => goToPage(currentPage - 1))
  pagination.appendChild(previous)

  for (let page = start; page <= end; page++) {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = page

    if (page === currentPage) {
      button.setAttribute('aria-current', 'page')
    }

    button.addEventListener('click', () => goToPage(page))
    pagination.appendChild(button)
  }

  const next = document.createElement('button')
  next.type = 'button'
  next.textContent = '>'
  next.disabled = currentPage === totalPages
  next.setAttribute('aria-label', 'Proxima pagina')
  next.addEventListener('click', () => goToPage(currentPage + 1))
  pagination.appendChild(next)
}

function goToPage(page) {
  currentPage = page
  loadMovies()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Busca um intervalo de páginas do TMDB usando filtros e ordenação atuais.
async function requestDiscoverPages({ firstPage, lastPage, withGenres }) {
  const sortOption = SORT_OPTIONS[currentSort]
  const requests = []
  for (let tmdbPage = firstPage; tmdbPage <= lastPage; tmdbPage++) {
    requests.push(
      tmdb.discoverMovie({
        page: tmdbPage,
        language: 'pt-BR',
        includeAdult: false,
        sortBy: sortOption.sortBy,
        withGenres,
        primaryReleaseDateLte: sortOption.onlyReleased
          ? formatDate(new Date())
          : '',
        voteCountGte: 1,
      })
    )
  }

  return await Promise.all(requests)
}

// Busca filmes suficientes para preencher a página após remover dados incompletos.
async function fetchThirtyMovies(page) {
  const withGenres = selectedGenreIds.length > 0 ? selectedGenreIds.join('|') : ''
  const targetCount = page * MOVIES_PER_PAGE
  const validMovies = []
  let totalMovies = 0
  let totalTmdbPages = 1
  let tmdbPage = 1

  while (validMovies.length < targetCount && tmdbPage <= totalTmdbPages) {
    const batchEnd = Math.min(tmdbPage + 2, totalTmdbPages)
    const responses = await requestDiscoverPages({
      firstPage: tmdbPage,
      lastPage: batchEnd,
      withGenres,
    })

    totalMovies = responses[0]?.total_results || totalMovies
    totalTmdbPages = Math.min(responses[0]?.total_pages || totalTmdbPages, 500)
    validMovies.push(
      ...responses
        .flatMap((response) => response.results || [])
        .filter(hasRequiredMovieData)
    )
    tmdbPage = batchEnd + 1
  }

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const movies = validMovies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
  const hasMoreKnownResults = tmdbPage <= totalTmdbPages
  const filteredTotal = hasMoreKnownResults ? totalMovies : validMovies.length

  return { movies, totalMovies: filteredTotal }
}

// Coordena busca, estado de carregamento e renderização.
async function loadMovies() {
  const requestId = ++latestRequestId
  setLoading()

  try {
    const { movies, totalMovies } = await fetchThirtyMovies(currentPage)
    if (requestId !== latestRequestId) return
    renderMovies(movies)
    renderPagination(totalMovies)
  } catch (error) {
    console.error(error)
    status.textContent = 'Nao foi possivel carregar os filmes agora.'
  }
}

// Inicializa a tela carregando gêneros e a primeira página de filmes.
async function init() {
  try {
    const genreData = await tmdb.getMovieGenresList('pt-BR')
    genres = genreData.genres || []
    initGenresToggle()
    initSortControl()
    renderGenres()
    renderSelectedTags()
    await loadMovies()
  } catch (error) {
    console.error(error)
    status.textContent = 'Nao foi possivel carregar os generos.'
  }
}

init()
