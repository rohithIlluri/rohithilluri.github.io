// TMDB (The Movie Database) API configuration
export const TMDB_CONFIG = {
  API_KEY: process.env.REACT_APP_TMDB_API_KEY,
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  IMAGE_BASE_URL_SMALL: 'https://image.tmdb.org/t/p/w200',
};

// Favorite movies with their TMDB IDs and descriptions
export const FAVORITE_MOVIES = [
  {
    id: 24, // Kill Bill: Vol. 1
    name: 'Kill Bill: Vol. 1',
    description: 'swords and revenge',
    initials: 'KB',
    tmdbUrl: 'https://www.themoviedb.org/movie/24-kill-bill-vol-1',
    year: 2003
  },
  {
    id: 155, // The Dark Knight
    name: 'The Dark Knight',
    description: 'Epic superhero masterpiece',
    initials: 'TD',
    tmdbUrl: 'https://www.themoviedb.org/movie/155',
    year: 2008
  },
  {
    id: 157336, // Interstellar
    name: 'Interstellar',
    description: 'Space exploration epic',
    initials: 'IN',
    tmdbUrl: 'https://www.themoviedb.org/movie/157336',
    year: 2014
  },
  {
    id: 680, // Pulp Fiction
    name: 'Pulp Fiction',
    description: 'Quentin Tarantino classic',
    initials: 'PF',
    tmdbUrl: 'https://www.themoviedb.org/movie/680',
    year: 1994
  }
];

// TMDB API endpoints
export const TMDB_ENDPOINTS = {
  MOVIE: '/movie',
  SEARCH: '/search/movie',
};
