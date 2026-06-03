import { getApiReadKey } from '../api/constants.js'
import { TMDb } from '../api/tmdb.js'
import { createTVCard } from '../ui/elementsFactory.js'
import { renderMediaPage } from '../ui/renderMediaPage.js'

const tmdb = new TMDb(await getApiReadKey())
const currentYear = new Date().getFullYear()
const mediaGrid = document.querySelector('.media-cards')
const paginationDiv = document.querySelector('#pagination')
const genres = await tmdb.getTVGenresList()

renderMediaPage({
  tmdb,
  type: 'tv',
  cardCreator: createTVCard,
  discoverFunction: tmdb.discoverTV.bind(tmdb),
  discoverOptions: { firstAirYear: currentYear },
  genresList: genres.genres,
  grid: mediaGrid,
  emptyMessage: 'Nenhuma série encontrada.',
  paginationDiv: paginationDiv,
})
