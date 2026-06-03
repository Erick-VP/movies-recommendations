import { getApiReadKey } from '../api/constants.js'
import { TMDb } from '../api/tmdb.js'
import { createPeopleDetails } from '../ui/elementsFactory.js'
import { hideLoading, showLoading } from '../ui/loading.js'

showLoading()
const tmdb = new TMDb(await getApiReadKey())
const params = new URLSearchParams(window.location.search)
const id = params.get('id')

const person = await tmdb.getPerson(id, [
  'images',
  'movie_credits',
  'tv_credits',
])

const container = document.querySelector('main')
container.appendChild(createPeopleDetails(person))
hideLoading()
