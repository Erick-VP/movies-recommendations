import { hideLoading, showLoading } from './loading.js'

export function createPagination({
  paginationDiv,
  grid,
  fetchPage,
  cardCreator,
  genres,
  maxButtons = 10,
}) {
  async function load(page = 1) {
    const data = await fetchPage(page)
    if (data.results?.length === 0 || !data || data.episodes?.length === 0)
      return

    renderItems(data.results || data.episodes)
    renderPaginationControls(data.total_pages || data.seasons_number, page)
  }

  function renderItems(list) {
    grid.innerHTML = '<div id="loading" class="loading hidden"></div>'
    showLoading()
    list.forEach((item) => grid.appendChild(cardCreator(item, { genres })))
    hideLoading()
  }

  function renderPaginationControls(totalPages, currentPage) {
    paginationDiv.innerHTML = ''

    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let end = Math.min(totalPages, start + maxButtons - 1)

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1)
    }

    for (let page = start; page <= end; page++) {
      const btn = document.createElement('button')
      btn.textContent = page

      if (page === currentPage) {
        btn.classList.add('active')
        btn.setAttribute('aria-current', 'page')
      }

      btn.addEventListener('click', () => load(page))
      paginationDiv.appendChild(btn)
    }
  }

  return { load }
}
