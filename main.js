const apiKey = import.meta.env.VITE_API_ACCESS_KEY;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${apiKey}`
  }
}

let watchList = []
let moviesToRender = []
let searchInputEl, mainEl, mainWatchEl

const moviesFromLS = sessionStorage.getItem('movies')
if (moviesFromLS) {
  moviesToRender = JSON.parse(moviesFromLS)
}

const watchListFromLS = localStorage.getItem('watchlist')
if (watchListFromLS) {
  watchList = JSON.parse(watchListFromLS)
}
const movieIndexWatchlist = watchList.map(film => film.id)

const startScreenIndex = `
  <img class="start__image" alt="film frame" src="./assets/film-icon.svg">
  <h3 class="start__text">Start exploring</h3>
`

const emptyScreenWatch = `
  <h3 class="start__text start__text-watch">
    Your watchlist is looking a little empty...
  </h3>
  <a class="watch__link" href="./index.html">
    <img
      src="./assets/plus-icon.svg"
      alt="plus"
      class="watch__plus-icon"
    >
    Let’s add some movies!
  </a>
`

const pathname = window.location.pathname

if (pathname === '/index.html' || pathname === '/') {
  searchInputEl = document.getElementById('search__input')
  document.getElementById('search__btn').addEventListener('click', getMovies)
  mainEl = document.getElementById('main')
  mainEl.addEventListener('click', handlerMainClickIndex)
  if (moviesToRender.length > 0) {
    renderMovies(moviesToRender, 'index')
  } else {
    mainEl.innerHTML = startScreenIndex
    mainEl.style.display = 'flex'
  }
} else if (pathname.includes('/watchlist')) {
  mainWatchEl = document.getElementById('main-watch')
  mainWatchEl.addEventListener('click', handlerMainClickWatch)
  if (watchList.length > 0) {
    renderMovies(watchList, 'watch')
  } else {
    mainWatchEl.innerHTML = emptyScreenWatch
    mainWatchEl.style.display = 'flex'
  }
}

async function getMovies() {
  let movieTitle = searchInputEl.value.trim()
  if (movieTitle) {
    movieTitle = movieTitle.toLowerCase().replace(' ', '%20')

    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${movieTitle}&include_adult=false&language=en-US&page=1`,
        options)
      const movies = await res.json()
      sessionStorage.setItem('movies', JSON.stringify(movies.results))
      
      moviesToRender = movies.results
      if (moviesToRender.length > 0) {
        renderMovies(movies.results, 'index')
      } else {
        renderEmptySearchResult()
      }
    }
    catch(err) {console.error(err)}
    searchInputEl.value = ''
  } else {
    renderEmptySearchResult()
  }
}

function createMovieBlock(movie, i, page) {
  return `
    <div class="movie__block">
      <img
        src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
        alt="poster of movie"
        class="movie__poster"
      >
      <div class="text__container">
        <div class="movie__title-container">
          <h2 class="movie__title">
            ${movie.title}
          </h2>
          <img src="./assets/star.svg" alt="star of rate" class="star-icon">
          <p class="movie__rate">${movie.popularity}</p>
        </div>
        <div class="movie__info-container">
          <p class="movie__info-time">
            ${movie.release_date}
          </p>
          <p class="movie__info-lang">
            Orig. lang: ${movie.original_language}
          </p>
          ${page === 'index'
            ? `<button
                  class="add-watchlist-btn"
                  id="add-watchlist-btn-${page}-${i}"
                  type="button"
                  ${movieIndexWatchlist.includes(movie.id)
                    ? 'disabled'
                    : ''
                  }
                >
                  <img
                    src="./assets/plus-icon.svg"
                    alt="plus"
                    class="plus-icon"
                    id="plus-icon-${page}-${i}"
                  >
                  Watchlist
                </button>`
            : `<button
                class="minus-watchlist-btn"
                id="minus-watchlist-btn-${page}-${i}"
                type="button"
              >
                <img
                  src="./assets/minus-icon.svg"
                  alt="minus"
                  class="minus-icon"
                  id="minus-icon-${page}-${i}"
                >
                Remove
              </button>`
          }
          </div>
          <p class="movie__plot-${page}" id="movie-plot-${page}-${i}">
          ${movie.overview}
          </p>
          ${page === 'index' && movieIndexWatchlist.includes(movie.id)
            ? `<p class="film-in-watch">
                The film is on your Watchlist.
              </p>`
            : ''
          }
      </div>
    </div>
  `
}

function createReadMore(id, page) {
  const readMoreBtn = document.createElement('button')
  readMoreBtn.classList.add('read-more-btn')
  readMoreBtn.id = `read-more-btn-${page}-${id}`
  readMoreBtn.innerHTML = '<span>...</span> Read more'
  return readMoreBtn
}

function renderMovies(moviesList, page) {
  const mainWorkEl = page === "index" ? mainEl : mainWatchEl

  mainWorkEl.innerHTML = moviesList
      .map((film, i) => createMovieBlock(film, i, page))
      .join('')
  mainWorkEl.style.display = 'block'

  const moviePlotList = document
    .getElementsByClassName(`movie__plot-${page}`)
  Array.from(moviePlotList).forEach((plot, i) => {
    if(plot.scrollHeight > plot.clientHeight) {
      const btn = createReadMore(i, page)
      plot.append(btn)
    }
  })
}

function renderEmptySearchResult() {
  mainEl.innerHTML = `
    <h3 class="empty-query__text">
      Unable to find what you’re looking<br>for. Please try 
      another search.
    </h3>
  `
  mainEl.style.display = 'flex'
  sessionStorage.removeItem('movies')
}

function handlerMainClickIndex(e) {
  handlerMainClick(e, 'index')
}

function handlerMainClickWatch(e) {
  handlerMainClick(e, 'watch')
}

function handlerMainClick(e, page) {
  const targetId = e.target.id
  const id = Number(targetId.match(/\d+/)[0])

  if (targetId.startsWith('add-watchlist-btn-')
    || targetId.startsWith('plus-icon-')) {
    watchList.push(moviesToRender[id])
    movieIndexWatchlist.push(moviesToRender[id].id)
    localStorage.setItem('watchlist', JSON.stringify(watchList))
    renderMovies(moviesToRender, 'index')
  } else if (targetId.startsWith('minus-watchlist-btn-')
    || targetId.startsWith('minus-icon-')) {
      watchList = watchList.filter((film, i) => i !== id)
    if (watchList.length > 0) {
      renderMovies(watchList, 'watch')
      localStorage.setItem('watchlist', JSON.stringify(watchList))
    } else {
      mainWatchEl.innerHTML = emptyScreenWatch
      mainWatchEl.style.display = 'flex'
      localStorage.removeItem('watchlist')
    }
  } else if (targetId.startsWith('read-more-btn-')) {
    const plotEl = document.getElementById(`movie-plot-${page}-${id}`)
    plotEl.style.display = 'block'
    document.getElementById(`read-more-btn-${page}-${id}`).remove()
  }
}
