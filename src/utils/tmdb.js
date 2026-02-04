import { TMDB_CONFIG, TMDB_ENDPOINTS } from '../constants/tmdb';

// Local movie poster images (fallback when API is not available)
const MOVIE_POSTERS = {
  24: 'https://image.tmdb.org/t/p/original/9yaVKBwvbvq3qL8zzSmuoxZuoFK.jpg', // Kill Bill: Vol. 1 - local image
  155: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // The Dark Knight
  157336: '/artists/interstellar.jpeg', // Interstellar - local image
  680: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', // Pulp Fiction
};

// Fetch movie data from TMDB
export const fetchMovieData = async (movieId) => {
  try {
    if (!TMDB_CONFIG.API_KEY) {
      // Return fallback data with direct poster URLs
      return {
        id: movieId,
        title: 'Movie',
        poster_path: MOVIE_POSTERS[movieId] ? MOVIE_POSTERS[movieId].split('/').pop() : null,
        release_date: 'Unknown',
        overview: 'No description available'
      };
    }

    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}${TMDB_ENDPOINTS.MOVIE}/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movie data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching movie data:', error);
    // Return fallback data with direct poster URLs
    return {
      id: movieId,
      title: 'Movie',
      poster_path: MOVIE_POSTERS[movieId] ? MOVIE_POSTERS[movieId].split('/').pop() : null,
      release_date: 'Unknown',
      overview: 'No description available'
    };
  }
};

// Get movie poster URL
export const getMoviePosterUrl = (movieData, size = 'medium') => {
  if (!movieData || !movieData.poster_path) {
    return null;
  }

  // If we have a local poster image, use it
  if (MOVIE_POSTERS[movieData.id] && MOVIE_POSTERS[movieData.id].startsWith('/')) {
    return MOVIE_POSTERS[movieData.id];
  }

  // If we have a direct poster URL, use it
  if (MOVIE_POSTERS[movieData.id]) {
    return size === 'small' ? MOVIE_POSTERS[movieData.id].replace('/w500/', '/w200/') : MOVIE_POSTERS[movieData.id];
  }

  const baseUrl = size === 'small' ? TMDB_CONFIG.IMAGE_BASE_URL_SMALL : TMDB_CONFIG.IMAGE_BASE_URL;
  return `${baseUrl}${movieData.poster_path}`;
};

// Search movies by title
export const searchMovies = async (query) => {
  try {
    if (!TMDB_CONFIG.API_KEY) {
      return { results: [] };
    }

    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}${TMDB_ENDPOINTS.SEARCH}?api_key=${TMDB_CONFIG.API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
    );

    if (!response.ok) {
      throw new Error('Failed to search movies');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching movies:', error);
    return { results: [] };
  }
};
