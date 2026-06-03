export class TMDb {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseURL = 'https://api.themoviedb.org/3'
    // Cabeçalhos padrão para todas as requisições autenticadas no TMDB.
    this.GETOptions = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    }
  }

  // Monta o parâmetro append_to_response usado em detalhes de mídia.
  appendToResponseURL(extraAttrs) {
    return `&append_to_response=${extraAttrs.join(',')}`
  }

  // URL base das buscas por texto para filmes, séries, pessoas ou multi.
  defaultSearchURL(query, language, page, includeAdult, type) {
    return `${this.baseURL}/search/${type}?query=${encodeURIComponent(
      query
    )}&language=${language}&include_adult=${includeAdult}&page=${page}`
  }

  // Centraliza fetch, conversão para JSON e tratamento de erros da API.
  async fetchJSON(url, errorMessage) {
    try {
      const response = await fetch(url, this.GETOptions)
      if (!response.ok)
        throw new Error(`${errorMessage} (status: ${response.status})`)
      return await response.json()
    } catch (error) {
      console.error(`❌ [TMDb Error]: ${error.message}`)
      throw error
    }
  }

  async getMovie(movieId, appendToResponse = [], language = 'pt-BR') {
    let url = `${this.baseURL}/movie/${movieId}?language=${language}`
    if (appendToResponse.length > 0)
      url += this.appendToResponseURL(appendToResponse)
    return this.fetchJSON(url, 'Movie not found')
  }

  async getTV(TVId, appendToResponse = [], language = 'pt-BR') {
    let url = `${this.baseURL}/tv/${TVId}?language=${language}`
    if (appendToResponse.length > 0)
      url += this.appendToResponseURL(appendToResponse)
    return this.fetchJSON(url, 'Series not found')
  }

  async getTVSeason(
    TVId,
    seasonNumber,
    appendToResponse = [],
    language = 'pt-BR'
  ) {
    let url = `${this.baseURL}/tv/${TVId}/season/${seasonNumber}?language=${language}`
    if (appendToResponse.length > 0)
      url += this.appendToResponseURL(appendToResponse)
    return this.fetchJSON(url, 'Season not found')
  }

  async getTVEpisode(
    TVId,
    seasonNumber,
    episodeNumber,
    appendToResponse = [],
    language = 'pt-BR'
  ) {
    let url = `${this.baseURL}/tv/${TVId}/season/${seasonNumber}/episode/${episodeNumber}?language=${language}`
    if (appendToResponse.length > 0)
      url += this.appendToResponseURL(appendToResponse)
    return this.fetchJSON(url, 'Episode not found')
  }

  async getPerson(personId, appendToResponse = [], language = 'pt-BR') {
    let url = `${this.baseURL}/person/${personId}?language=${language}`
    if (appendToResponse.length > 0)
      url += this.appendToResponseURL(appendToResponse)
    return this.fetchJSON(url, 'Person not found')
  }

  async getCompany(companyId) {
    const url = `${this.baseURL}/company/${companyId}`
    return this.fetchJSON(url, 'Company not found')
  }

  async getPopular(type, { page = 1, language = 'pt-BR', region = '' } = {}) {
    let url = `${this.baseURL}/${type}/popular?language=${language}&page=${page}`
    if (region !== '') url += `&region=${region}`
    return this.fetchJSON(url, `No popular ${type} found`)
  }

  async getTrending(type, timeWindow, page = 1, language = 'pt-BR') {
    let url = `${this.baseURL}/trending/${type}/${timeWindow}?language=${language}&page=${page}`
    return this.fetchJSON(url, `No trending ${type} found`)
  }

  // Lista os gêneros de filmes usados nos checkboxes da página.
  async getMovieGenresList(language = 'pt-BR') {
    const url = `${this.baseURL}/genre/movie/list?language=${language}`
    return this.fetchJSON(url, 'Error fetching movie genres')
  }

  async getTVGenresList(language = 'pt-BR') {
    const url = `${this.baseURL}/genre/tv/list?language=${language}`
    return this.fetchJSON(url, 'Error fetching series genres')
  }

  async searchMovie(
    query,
    {
      appendToResponse = [],
      language = 'pt-BR',
      includeAdult = false,
      primaryReleaseYear = 0,
      page = 1,
      region = '',
      year = 0,
    } = {}
  ) {
    let url = this.defaultSearchURL(
      query,
      language,
      page,
      includeAdult,
      'movie'
    )
    if (appendToResponse.length > 0)
      url += this.appendToResponseURL(appendToResponse)
    if (primaryReleaseYear) url += `&primary_release_year=${primaryReleaseYear}`
    if (year) url += `&year=${year}`
    if (region) url += `&region=${region}`
    return this.fetchJSON(url, 'No movies found')
  }

  async searchTV(
    query,
    {
      language = 'pt-BR',
      includeAdult = false,
      firstAirDateYear = 0,
      page = 1,
      year = 0,
    } = {}
  ) {
    let url = this.defaultSearchURL(query, language, page, includeAdult, 'tv')
    if (firstAirDateYear) url += `&first_air_date_year=${firstAirDateYear}`
    if (year) url += `&year=${year}`
    return this.fetchJSON(url, 'No series found')
  }

  async searchPerson(
    query,
    { language = 'pt-BR', includeAdult = false, page = 1 } = {}
  ) {
    let url = this.defaultSearchURL(
      query,
      language,
      page,
      includeAdult,
      'person'
    )
    return this.fetchJSON(url, 'No person found')
  }

  async searchMulti(
    query,
    { language = 'pt-BR', includeAdult = false, page = 1 } = {}
  ) {
    let url = this.defaultSearchURL(
      query,
      language,
      page,
      includeAdult,
      'multi'
    )
    return this.fetchJSON(url, 'No series, movie or person found')
  }

  // Busca filmes por descoberta, aceitando filtros de gênero, data, nota e ordenação.
  async discoverMovie({
    appendToResponse = [],
    language = 'pt-BR',
    includeAdult = false,
    primaryReleaseYear = 0,
    page = 1,
    region = '',
    year = 0,
    sortBy = 'popularity.desc',
    withGenres = '',
    primaryReleaseDateLte = '',
    voteCountGte = 0,
  } = {}) {
    let url = `${this.baseURL}/discover/movie?language=${language}&page=${page}`

    url += `&include_adult=${includeAdult}`
    url += `&sort_by=${sortBy}`

    if (appendToResponse.length > 0)
      url += this.appendToResponseURL(appendToResponse)

    if (primaryReleaseYear) url += `&primary_release_year=${primaryReleaseYear}`

    if (year) url += `&year=${year}`

    if (region) url += `&region=${region}`

    if (withGenres) url += `&with_genres=${withGenres}`

    if (primaryReleaseDateLte)
      url += `&primary_release_date.lte=${primaryReleaseDateLte}`

    if (voteCountGte) url += `&vote_count.gte=${voteCountGte}`

    return this.fetchJSON(url, 'No movies found')
  }

  async discoverTV({
    appendToResponse = [],
    language = 'pt-BR',
    includeAdult = false,
    firstAirYear = 0,
    page = 1,
    region = '',
    year = 0,
    sortBy = 'popularity.desc',
    withGenres = '',
  } = {}) {
    let url = `${this.baseURL}/discover/tv?language=${language}&page=${page}`

    url += `&include_adult=${includeAdult}`
    url += `&sort_by=${sortBy}`

    if (appendToResponse.length > 0)
      url += this.appendToResponseURL(appendToResponse)

    if (firstAirYear) url += `&first_air_date_year=${firstAirYear}`

    if (year) url += `&year=${year}`

    if (region) url += `&region=${region}`

    if (withGenres) url += `&with_genres=${withGenres}`

    return this.fetchJSON(url, 'No TV shows found')
  }
}

export function filterByGenre(list, genreId) {
  if (!Array.isArray(list)) {
    console.error('List parameter must be array o be filtered')
    return []
  }

  return list.filter(
    (item) => Array.isArray(item.genre_ids) && item.genre_ids.includes(genreId)
  )
}
