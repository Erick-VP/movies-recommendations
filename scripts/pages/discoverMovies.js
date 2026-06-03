import { getApiReadKey } from '../api/constants.js'
import { TMDb } from '../api/tmdb.js'
import { createMovieCard } from '../ui/elementsFactory.js'
import { renderMediaPage } from '../ui/renderMediaPage.js'

const tmdb = new TMDb(await getApiReadKey())
const currentYear = new Date().getFullYear()
const mediaGrid = document.querySelector('.media-cards')
const paginationDiv = document.querySelector('#pagination')
const genres = await tmdb.getMovieGenresList()

renderMediaPage({
  tmdb,
  type: 'movie',
  cardCreator: createMovieCard,
  discoverFunction: tmdb.discoverMovie.bind(tmdb),
  discoverOptions: { primaryReleaseYear: currentYear },
  genresList: genres.genres,
  grid: mediaGrid,
  emptyMessage: 'Nenhum filme encontrado.',
  paginationDiv: paginationDiv,
})
