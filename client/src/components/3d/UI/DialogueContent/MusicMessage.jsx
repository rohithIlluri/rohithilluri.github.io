import React from 'react';

export default function MusicMessage({ data }) {
  if (!data || !data.artists) return null;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {data.artists.map((artist, idx) => (
        <a
          key={idx}
          href={artist.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            background: 'rgba(30, 215, 96, 0.08)',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'background 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(30, 215, 96, 0.15)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(30, 215, 96, 0.08)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          {/* Spotify-style icon */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#1DB954',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>

          {/* Artist info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '2px',
              }}
            >
              {artist.name}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(0,0,0,0.5)',
              }}
            >
              {artist.description}
            </div>
          </div>

          {/* Play indicator */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#1DB954"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </a>
      ))}
    </div>
  );
}
