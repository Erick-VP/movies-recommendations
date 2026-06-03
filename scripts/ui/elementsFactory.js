import { getApiReadKey } from '../api/constants.js'
import { TMDb } from '../api/tmdb.js'
import { createPagination } from './pagination.js'
import { formatTime } from '../utils/utils.js'

function createImg(src) {
  const img = $('img')
  img.src = src
  return img
}

function $(tagName) {
  return document.createElement(tagName)
}

function getPoster(src) {
  return src
    ? 'https://image.tmdb.org/t/p/original' + src
    : '/assets/images/not-found-img.png'
}

function resolveGenres(media, genres) {
  return media.genres
    ? media.genres
    : genres.filter((g) => media.genre_ids?.includes(g.id))
}

export function createPeopleDetails(person) {
  const section = $('section')
  section.classList.add('people-details')

  // === NOME ===
  const nameEl = $('h1')
  nameEl.classList.add('title-people', 'people-name')
  nameEl.textContent = person.name

  // === PROFISSÃO ===
  const professionEl = $('p')
  professionEl.classList.add('profession')
  professionEl.textContent = person.known_for_department || ''

  // === IMAGEM PRINCIPAL ===
  const boxImage = $('div')
  boxImage.classList.add('box-image-people')

  const mainImg = $('img')
  mainImg.classList.add('img-people')
  mainImg.src = getPoster(person.profile_path)
  mainImg.alt = `Foto de ${person.name}`
  boxImage.appendChild(mainImg)

  // === BIOGRAFIA ===
  const bio = $('p')
  bio.classList.add('biography')
  bio.textContent = person.biography || 'Biografia não disponível.'

  // === IMAGENS ===
  const imagesTitle = $('h2')
  imagesTitle.classList.add('title-people')
  imagesTitle.textContent = 'Imagens'

  const imagesList = $('div')
  imagesList.classList.add('list-images-people')

  const images = person.images?.profiles || []

  images.forEach((img) => {
    const image = $('img')
    image.src = getPoster(img.file_path)
    image.alt = `Imagem de ${person.name}`
    imagesList.appendChild(image)
  })

  // === CONHECIDO POR ===
  const knownForTitle = $('h2')
  knownForTitle.classList.add('title-people')
  knownForTitle.textContent = 'Conhecido por'

  const participationDiv = $('div')
  participationDiv.classList.add('movie-participation')

  const participations = $('div')
  participations.classList.add('imgs-participation')

  // Juntando filmes + séries
  const knownFor = [
    ...(person.movie_credits?.cast || []),
    ...(person.tv_credits?.cast || []),
  ]

  // Ordenar por popularidade
  knownFor.slice(0, 8).forEach((item) => {
    if (item.title) {
      item = createMovieCard(item)
    } else {
      item = createTVCard(item)
    }
    participations.appendChild(item)
  })

  participationDiv.appendChild(participations)

  // === MONTAR A SECTION ===
  section.append(
    nameEl,
    professionEl,
    boxImage,
    bio,
    imagesTitle,
    imagesList,
    knownForTitle,
    participationDiv
  )

  return section
}

function createEpisodeCard(episode) {
  const card = $('div')
  card.classList.add('episodes-card')

  const epImgDiv = $('div')
  epImgDiv.classList.add('ep-img-wrap')

  const epImg = $('img')
  epImg.classList.add('img-ep')
  epImg.src = getPoster(episode.still_path)
  epImg.alt = 'imagem da temporada'

  epImgDiv.appendChild(epImg)

  const epInfoDiv = $('div')
  epInfoDiv.classList.add('info-ep')

  const epTitle = $('h3')
  epTitle.classList.add('title-ep')
  epTitle.innerHTML = `T<span id="num-season">${episode.season_number}</span>.E<span id="num-ep">${episode.episode_number}</span> - ${episode.name}`

  const durationP = $('p')
  durationP.classList.add('duration-ep')
  durationP.innerHTML = `<span class="duration-number">${formatTime(
    episode.runtime
  )}</span>`

  const synopsisP = $('p')
  synopsisP.classList.add('synopsis-ep')
  synopsisP.textContent = episode.overview || 'Sinopse não disponível'

  epInfoDiv.append(epTitle, durationP, synopsisP)
  card.append(epImgDiv, epInfoDiv)
  return card
}

function createMediaCard(
  media,
  { titleKey = 'title', dateKey = 'release_date', genres = [] } = {}
) {
  // === CARD ===
  const card = $('div')
  card.classList.add('card-media')
  // === details ===
  card.addEventListener('click', () => {
    window.location.href = media.title
      ? `/filmes/details/detalhes.html?id=${media.id}`
      : `/tv/details/detalhes.html?id=${media.id}`
  })

  // === POSTER ===
  const img = createImg(getPoster(media.poster_path))
  img.classList.add('img-media')
  img.id = 'img-media'
  img.alt = media[titleKey]

  // === TÍTULO ===
  const title = $('h2')
  title.classList.add('title-media')
  title.id = 'title-media'
  title.textContent = media[titleKey] || '---'

  // === INFO (rating + data) ===
  const info = $('div')
  info.classList.add('info-media')

  const ratingInfo = $('div')
  ratingInfo.classList.add('rating-info')

  const star = $('p')
  star.innerHTML = `<i class="fa-solid fa-star"></i>`

  const ratingP = $('p')
  ratingP.classList.add('rating')
  ratingP.id = 'rating'
  ratingP.innerHTML = `<span id="rating-number">${
    media.vote_average ? media.vote_average.toFixed(2) : '---'
  }</span>/10`

  ratingInfo.append(star, ratingP)

  const dateP = $('p')
  dateP.classList.add('data-media')
  dateP.id = 'data-media'
  dateP.textContent = media[dateKey] || '---'

  info.append(ratingInfo, dateP)

  // === GÊNEROS ===
  const genresDiv = $('div')
  genresDiv.classList.add('genres-media')

  const resolvedGenres = resolveGenres(media, genres)

  resolvedGenres.slice(0, 3).forEach((g) => {
    const div = $('div')
    div.classList.add('genre')

    const p = $('p')
    p.textContent = g.name

    div.appendChild(p)
    genresDiv.appendChild(div)
  })

  // === CONTAINER ===
  const contentDiv = $('div')
  contentDiv.classList.add('media-content')
  contentDiv.append(title, info, genresDiv)

  // === FINAL ===
  card.append(img, contentDiv)
  return card
}

export function createMovieCard(movie, options = {}) {
  return createMediaCard(movie, {
    titleKey: 'title',
    dateKey: 'release_date',
    ...options,
  })
}

export function createTVCard(tv, options = {}) {
  return createMediaCard(tv, {
    titleKey: 'name',
    dateKey: 'first_air_date',
    ...options,
  })
}

function createCastCard(actor) {
  const card = $('div')
  card.classList.add('card-movie-info')

  const wrap = $('div')
  wrap.classList.add('movie-img-wrap')

  const img = createImg(getPoster(actor.profile_path))
  img.classList.add('movie-img')
  img.alt = actor.original_name

  wrap.appendChild(img)

  const name = $('p')
  name.classList.add('actor-name')
  name.textContent = actor.original_name

  card.append(wrap, name)
  return card
}

function createImageCard(image) {
  const card = $('div')
  card.classList.add('card-movie-info')

  const wrap = $('div')
  wrap.classList.add('movie-img-wrap')

  const img = createImg(getPoster(image.file_path))
  img.classList.add('movie-img')
  img.alt = 'imagem da obra'

  wrap.appendChild(img)
  card.appendChild(wrap)

  return card
}

export function createMediaDetailsPage(media, genres = []) {
  const majorContainer = $('div')
  majorContainer.id = 'media-details'
  majorContainer.classList.add('details-overlay')

  const content = $('div')
  content.classList.add('details-content')

  // === POSTER ===
  const poster = createImg(getPoster(media.poster_path))
  poster.id = 'details-poster'
  poster.classList.add('details-poster')
  poster.alt = media.title || media.name

  // === DETAILS CONTAINER ===
  const detailsContainer = $('div')
  detailsContainer.classList.add('details-details-container')

  const info = $('div')
  info.classList.add('details-info')

  // === TÍTULO ===
  const title = $('h2')
  title.id = 'details-title'
  title.textContent = media.title || media.name

  // === DATA + DURAÇÃO ===
  const timeInfo = $('div')
  timeInfo.classList.add('time-info')

  const dateP = $('p')
  dateP.classList.add('details-date')
  dateP.id = 'details-date'
  dateP.textContent = media.release_date || media.first_air_date || '---'

  const durationP = $('p')
  durationP.classList.add('details-duration')
  durationP.id = 'details-duration'
  const formatedTime = formatTime(media.runtime)
  durationP.innerHTML = `<span>${
    formatedTime.includes('NaN') ? '' : formatedTime
  }</span>`

  timeInfo.append(dateP, durationP)

  // === RATING ===
  const rating = $('p')
  rating.classList.add('details-rating')
  rating.innerHTML = `
    <i class="fa-solid fa-star"></i>
    <span id="details-rating-number">
      ${media.vote_average ? media.vote_average.toFixed(2) : '--'}
    </span>/10
  `

  // === SINOPSE ===
  const synopsis = $('h3')
  synopsis.classList.add('details-synopsis')
  synopsis.textContent = media.overview || 'Sinopse não disponível'

  info.append(title, timeInfo, rating, synopsis)
  detailsContainer.appendChild(info)

  content.append(poster, detailsContainer)

  majorContainer.appendChild(content)

  // === GÊNEROS ===
  const genreContainer = $('div')
  genreContainer.classList.add('genre-container')

  const resolvedGenres = resolveGenres(media, genres)

  resolvedGenres.forEach((g) => {
    const div = $('div')
    div.classList.add('genres-media')

    const p = $('p')
    p.classList.add('genre-details')
    p.textContent = g.name

    div.appendChild(p)
    genreContainer.appendChild(div)
  })

  majorContainer.appendChild(genreContainer)

  // === INFO SECUNDÁRIA ===
  const infoSection = $('section')
  infoSection.classList.add('movie-info-container')

  // === ELENCO ===
  const crew = media.credits.crew
  const directors = crew
    .filter((e) => e.known_for_department === 'Directing')
    .map((e) => `<a href="/pessoas/details.html?id=${e.id}">${e.name}</a>`)
  const productors = crew
    .filter((e) => e.known_for_department === 'Production')
    .map((e) => `<a href="/pessoas/details.html?id=${e.id}">${e.name}</a>`)

  // === TEMPORADAS (para séries) ===
  const seasonsDiv = $('div')
  seasonsDiv.classList.add('seasons-info')
  if (media.name) {
    async function fetchSeason(seasonNumber, tv = media) {
      const tmdb = new TMDb(await getApiReadKey())
      const season = await tmdb.getTVSeason(tv.id, seasonNumber)
      return { ...season, seasons_number: tv.seasons.length }
    }

    const seasonsTitle = $('h2')
    seasonsTitle.classList.add('title-details-items')

    const seasonsPagination = $('ul')
    seasonsPagination.classList.add('pagination')

    const epsCardsContentDiv = $('div')
    epsCardsContentDiv.classList.add('episodes-list')

    seasonsDiv.append(seasonsTitle, seasonsPagination, epsCardsContentDiv)

    const pagination = createPagination({
      paginationDiv: seasonsPagination,
      grid: epsCardsContentDiv,
      fetchPage: fetchSeason,
      cardCreator: createEpisodeCard,
      genres: [],
    })
    pagination.load(1)
  }

  // === PRODUTORES ===
  const productorsP = $('p')
  productorsP.innerHTML = `Produtores:
      <span class="movie-info" id="film-direction">
        ${
          Array.isArray(productors) && productors.length > 0
            ? productors.join(', ')
            : '---'
        }
      </span>`

  const hr1 = $('hr')
  hr1.classList.add('line')

  const dirP = $('p')
  dirP.innerHTML = `Direção:
  <span class="movie-info" id="productors">
  ${
    Array.isArray(directors) && directors.length > 0
      ? directors.join(', ')
      : '---'
  }
  </span>`

  const hr2 = $('hr')
  hr2.classList.add('line')

  // === ELENCO ===
  const cast = media.credits.cast
  const actors = cast.filter((e) => e.known_for_department === 'Acting')

  const castDiv = $('div')
  castDiv.classList.add('cast-details')

  const castTitle = $('h2')
  castTitle.classList.add('title-details-items')
  castTitle.textContent = 'Elenco'

  const castCards = $('div')
  castCards.classList.add('movie-info-cards')

  if (actors && actors.length > 0) {
    actors.slice(0, 10).forEach((actor) => {
      const card = createCastCard(actor)
      card.addEventListener('click', () => {
        window.location.href = `/pessoas/details.html?id=${actor.id}`
      })
      castCards.appendChild(card)
    })
  }

  castDiv.append(castTitle, castCards)

  // === IMAGENS ===
  const posters = media.images.posters
  const imagesDiv = $('div')
  imagesDiv.classList.add('images-details')

  const imgTitle = $('h2')
  imgTitle.classList.add('title-details-items')
  imgTitle.textContent = 'Imagens'

  const imagesCards = $('div')
  imagesCards.classList.add('movie-info-cards')

  if (posters && posters.length > 0) {
    posters.slice(0, 4).forEach((img) => {
      imagesCards.appendChild(createImageCard(img))
    })
  } else {
    imagesCards.textContent = 'Sem imagens'
  }

  imagesDiv.append(imgTitle, imagesCards)

  const recTitle = $('h2')
  recTitle.classList.add('title-details-items')
  recTitle.textContent = 'Recomendados'

  infoSection.append(
    dirP,
    hr1,
    productorsP,
    hr2,
    seasonsDiv,
    castDiv,
    imagesDiv,
    recTitle
  )

  majorContainer.appendChild(infoSection)

  // cards recomendados
  const recommend = media.recommendations
  const recCards = $('section')
  recCards.classList.add('media-cards')
  if (recommend.results.length > 0) {
    recommend.results.slice(0, 4).forEach((e) => {
      recCards.appendChild(
        media.title
          ? createMovieCard(e, { genres: genres })
          : createTVCard(e, { genres: genres })
      )
    })
  } else {
    recCards.textContent = 'Sem recomendados.'
  }

  majorContainer.appendChild(recCards)

  return majorContainer
}
