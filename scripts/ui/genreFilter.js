export function initGenreFilter({ genres, onFilterApply, onFilterClear }) {
  const filterIcon = document.querySelector('.filter-container i')
  const filterModal = document.getElementById('filterModal')
  const filterOverlay = document.getElementById('filterOverlay')
  const closeFilterBtn = document.getElementById('closeFilterBtn')
  const genresList = document.getElementById('genresList')

  let selectedGenreId = null

  function renderGenres() {
    genresList.innerHTML = ''
    genres.forEach((genre) => {
      const item = document.createElement('div')
      item.classList.add('genre-filter-item')
      item.textContent = genre.name

      if (selectedGenreId === genre.id) {
        item.classList.add('active')
      }

      item.addEventListener('click', () => {
        if (selectedGenreId === genre.id) {
          selectedGenreId = null
          onFilterClear()
        } else {
          selectedGenreId = genre.id
          onFilterApply([genre.id])
        }
        closeModal()
      })

      genresList.appendChild(item)
    })
  }

  function openModal() {
    filterModal.classList.remove('hidden')
    filterOverlay.classList.remove('hidden')
  }

  function closeModal() {
    filterModal.classList.add('hidden')
    filterOverlay.classList.add('hidden')
  }

  filterIcon.addEventListener('click', openModal)
  closeFilterBtn.addEventListener('click', closeModal)
  filterOverlay.addEventListener('click', closeModal)

  filterModal.addEventListener('click', (e) => {
    e.stopPropagation()
  })

  renderGenres()

  return {
    openModal,
    closeModal,
    getSelectedGenres: () => (selectedGenreId ? [selectedGenreId] : []),
  }
}
