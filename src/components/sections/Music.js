import React, { memo } from 'react';
import { MUSIC_ARTISTS } from '../../constants/spotify';

const Music = () => (
  <section id="music" aria-label="Music" style={{ marginBottom: '0.5rem' }}>
    <div className="term-block">
      <div className="term-cmd">
        <span className="term-prompt">❯</span>
        <span className="term-command">cat music.txt</span>
      </div>
      <div className="term-output">
        {MUSIC_ARTISTS.map((artist, i) => (
          <a
            key={artist.id}
            href={artist.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="term-list-item"
            style={{ textDecoration: 'none' }}
            aria-label={`Open ${artist.name} on Spotify`}
          >
            <span style={{ color: '#444', fontSize: '0.72rem', minWidth: '24px', flexShrink: 0 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ color: '#e4e4e4', minWidth: '140px', flexShrink: 0 }}>
              {artist.name}
            </span>
            <span style={{ color: '#444' }}>─</span>
            <span style={{ color: '#6b6b6b', fontSize: '0.78rem', flex: 1 }}>
              {artist.description}
            </span>
            <span style={{ color: '#2a2a2a', fontSize: '0.7rem', flexShrink: 0 }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default memo(Music);
