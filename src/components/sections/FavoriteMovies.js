import React, { memo } from 'react';
import { FAVORITE_MOVIES } from '../../constants/tmdb';

const FavoriteMovies = () => (
  <section id="favorite-movies" aria-label="Favorite Movies" style={{ marginBottom: '0.5rem' }}>
    <div className="term-block">
      <div className="term-cmd">
        <span className="term-prompt">❯</span>
        <span className="term-command">cat movies.txt</span>
      </div>
      <div className="term-output">
        {FAVORITE_MOVIES.map((movie, i) => (
          <a
            key={movie.id}
            href={movie.tmdbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="term-list-item"
            style={{ textDecoration: 'none' }}
            aria-label={`Open ${movie.name} on TMDB`}
          >
            <span style={{ color: '#444', fontSize: '0.72rem', minWidth: '24px', flexShrink: 0 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ color: '#e4e4e4', minWidth: '170px', flexShrink: 0 }}>
              {movie.name}
            </span>
            <span style={{ color: '#fbbf24', fontSize: '0.72rem', minWidth: '46px', flexShrink: 0 }}>
              ({movie.year})
            </span>
            <span style={{ color: '#444' }}>─</span>
            <span style={{ color: '#6b6b6b', fontSize: '0.78rem', flex: 1 }}>
              {movie.description}
            </span>
            <span style={{ color: '#2a2a2a', fontSize: '0.7rem', flexShrink: 0 }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default memo(FavoriteMovies);
