import React, { memo } from 'react';

const SKILLS = [
  { name: 'JavaScript',  color: '#fbbf24' },
  { name: 'TypeScript',  color: '#60a5fa' },
  { name: 'React',       color: '#22d3ee' },
  { name: 'Node.js',     color: '#4ade80' },
  { name: 'Python',      color: '#60a5fa' },
  { name: 'Java',        color: '#f87171' },
  { name: 'HTML/CSS',    color: '#fb923c' },
  { name: 'Tailwind CSS',color: '#22d3ee' },
  { name: 'Git',         color: '#fb923c' },
  { name: 'Docker',      color: '#60a5fa' },
  { name: 'AWS',         color: '#fb923c' },
  { name: 'MongoDB',     color: '#4ade80' },
  { name: 'PostgreSQL',  color: '#60a5fa' },
  { name: 'Express.js',  color: '#e4e4e4' },
  { name: 'Next.js',     color: '#e4e4e4' },
  { name: 'GraphQL',     color: '#f472b6' },
];

const Skills = () => (
  <section id="skills" aria-label="Skills" style={{ marginBottom: '0.5rem' }}>
    <div className="term-block">
      <div className="term-cmd">
        <span className="term-prompt">❯</span>
        <span className="term-command">ls skills/</span>
      </div>
      <div className="term-output">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
          {SKILLS.map((s) => (
            <span
              key={s.name}
              className="term-skill"
              style={{ color: s.color }}
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default memo(Skills);
