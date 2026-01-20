import React from 'react';

const skillColors = {
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  Python: '#3776AB',
  Java: '#ED8B00',
  React: '#61DAFB',
  'Next.js': '#000000',
  'HTML/CSS': '#E34F26',
  'Tailwind CSS': '#06B6D4',
  'Node.js': '#339933',
  'Express.js': '#000000',
  GraphQL: '#E10098',
  PostgreSQL: '#4169E1',
  MongoDB: '#47A248',
  Git: '#F05032',
  Docker: '#2496ED',
  AWS: '#FF9900',
};

export default function SkillsMessage({ data }) {
  if (!data || !data.categories) return null;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {data.categories.map((category, idx) => (
        <div key={idx}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(0,0,0,0.5)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {category.name}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            {category.skills.map((skill, skillIdx) => (
              <div
                key={skillIdx}
                style={{
                  background: `${skillColors[skill] || '#6B7280'}15`,
                  border: `1px solid ${skillColors[skill] || '#6B7280'}30`,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#1F2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: skillColors[skill] || '#6B7280',
                  }}
                />
                {skill}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
