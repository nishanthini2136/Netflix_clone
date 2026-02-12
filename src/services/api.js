const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjM2FjYzVlOGIxYTljNzM2ZGM3OThjNDllM2M5MDY5ZiIsIm5iZiI6MTc1MTc3NjU5MS4yODEsInN1YiI6IjY4NjlmZDRmOWRiZTkxODkxNjEwMzI4YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.wQarnuqPkkSaKXTyjUmHfFt32hF8O6d828L_pqvi28s';

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${API_KEY}`
};

export const apiService = {
  // Movies
  getMovies: async (category = 'now_playing', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/movie/${category}?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // TV Shows
  getTVShows: async (category = 'popular', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/tv/${category}?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // New & Popular (Trending)
  getTrending: async (mediaType = 'all', timeWindow = 'week', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/trending/${mediaType}/${timeWindow}?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Search
  search: async (query, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Movie/TV Show Details
  getDetails: async (id, type = 'movie') => {
    const response = await fetch(`${API_BASE_URL}/${type}/${id}?language=en-US`, { headers });
    return response.json();
  },

  // Genres for Browse by Languages
  getGenres: async (type = 'movie') => {
    const response = await fetch(`${API_BASE_URL}/genre/${type}/list?language=en-US`, { headers });
    return response.json();
  },

  // Movies/TV Shows by Genre
  getByGenre: async (type = 'movie', genreId, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/discover/${type}?with_genres=${genreId}&language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Top Rated
  getTopRated: async (type = 'movie', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/${type}/top_rated?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Upcoming Movies
  getUpcoming: async (page = 1) => {
    const response = await fetch(`${API_BASE_URL}/movie/upcoming?language=en-US&page=${page}`, { headers });
    return response.json();
  },

  // Popular
  getPopular: async (type = 'movie', page = 1) => {
    const response = await fetch(`${API_BASE_URL}/${type}/popular?language=en-US&page=${page}`, { headers });
    return response.json();
  }
};
