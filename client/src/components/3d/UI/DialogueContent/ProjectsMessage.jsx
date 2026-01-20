import React from 'react';

const techColors = {
  'Next.js': '#000000',
  React: '#61DAFB',
  Python: '#3776AB',
  JavaScript: '#F7DF1E',
};

export default function ProjectsMessage({ data }) {
  if (!data || !data.projects) return null;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {data.projects.map((project, idx) => (
        <a
          key={idx}
          href={project.url || '#'}
          target={project.url ? '_blank' : undefined}
          rel={project.url ? 'noopener noreferrer' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'background 0.2s ease, transform 0.2s ease',
            cursor: project.url ? 'pointer' : 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          {/* Tech badge */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: `${techColors[project.tech] || '#6B7280'}15`,
              border: `1px solid ${techColors[project.tech] || '#6B7280'}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 600,
              color: techColors[project.tech] || '#6B7280',
              flexShrink: 0,
            }}
          >
            {project.tech?.substring(0, 2).toUpperCase() || '??'}
          </div>

          {/* Project info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '2px',
              }}
            >
              {project.name}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {project.description}
            </div>
          </div>

          {/* Link indicator */}
          {project.url && (
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
          )}
        </a>
      ))}
    </div>
  );
}
