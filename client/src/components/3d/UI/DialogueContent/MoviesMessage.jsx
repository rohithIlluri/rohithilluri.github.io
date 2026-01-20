import React from 'react';

export default function MoviesMessage({ data }) {
  if (!data || !data.movies) return null;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {data.movies.map((movie, idx) => (
        <a
          key={idx}
          href={movie.tmdbUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            background: 'rgba(1, 180, 228, 0.08)',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'background 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(1, 180, 228, 0.15)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(1, 180, 228, 0.08)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          {/* Movie icon */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0d253f, #01b4e4)',
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
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
          </div>

          {/* Movie info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {movie.name}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  color: 'rgba(0,0,0,0.4)',
                  background: 'rgba(0,0,0,0.05)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {movie.year}
              </span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(0,0,0,0.5)',
              }}
            >
              {movie.description}
            </div>
          </div>

          {/* External link indicator */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      ))}
    </div>
  );
}
