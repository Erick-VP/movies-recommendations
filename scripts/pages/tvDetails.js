import { getApiReadKey } from '../api/constants.js'
import { TMDb } from '../api/tmdb.js'
import { createMediaDetailsPage } from '../ui/elementsFactory.js'
import { hideLoading, showLoading } from '../ui/loading.js'

showLoading()
const tmdb = new TMDb(await getApiReadKey())
const params = new URLSearchParams(window.location.search)
const id = params.get('id')
const tv = await tmdb.getTV(id, ['credits', 'images', 'recommendations'])
const genres = await tmdb.getTVGenresList()
const main = document.querySelector('main')

main.appendChild(createMediaDetailsPage(tv, genres.genres))
hideLoading()
