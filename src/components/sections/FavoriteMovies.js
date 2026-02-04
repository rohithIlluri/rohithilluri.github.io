import React, { memo, useState, useEffect } from 'react';
import { COMPONENT_STYLES } from '../../constants/theme';
import { FAVORITE_MOVIES } from '../../constants/tmdb';
import { fetchMovieData, getMoviePosterUrl } from '../../utils/tmdb';

const FavoriteMovies = () => {
  const [moviesData, setMoviesData] = useState({});

  useEffect(() => {
    const fetchMoviesData = async () => {
      const data = {};
      for (const movie of FAVORITE_MOVIES) {
        data[movie.id] = await fetchMovieData(movie.id);
      }
      setMoviesData(data);
    };

    fetchMoviesData();
  }, []);

  const handleMovieClick = (tmdbUrl) => {
    window.open(tmdbUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="favorite-movies" className={COMPONENT_STYLES.section.base} aria-label="Favorite Movies section">
      <div className={COMPONENT_STYLES.section.container}>
        <h2 className={COMPONENT_STYLES.section.heading}>Favorite Movies</h2>
        <p className="text-black/70 dark:text-slate-400 text-sm mb-6">
          Movies beyond the mainstream.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FAVORITE_MOVIES.map((movie) => {
            const movieData = moviesData[movie.id];
            const posterUrl = movieData ? getMoviePosterUrl(movieData, 'small') : null;
            
            return (
              <div 
                key={movie.id}
                onClick={() => handleMovieClick(movie.tmdbUrl)}
                className="flex items-center space-x-6 p-8 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer group min-h-[140px]"
              >
                {posterUrl ? (
                  <img 
                    src={posterUrl} 
                    alt={`${movie.name} poster`}
                    className="w-24 h-24 rounded-lg object-contain shadow-sm bg-white dark:bg-slate-800"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-24 h-24 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center text-gray-700 dark:text-slate-200 text-3xl font-bold flex-shrink-0 ${posterUrl ? 'hidden' : 'flex'}`}>
                  {movie.initials}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-black dark:text-white text-xl mb-2">{movie.name}</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-lg leading-relaxed">{movie.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default memo(FavoriteMovies);
