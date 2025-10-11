import React from 'react';
import { COMPONENT_STYLES } from '../../constants/theme';

const Stats = () => {
  const stats = [
    { label: 'Deadlift PR', value: '340 lbs' },
    { label: 'Bench Press', value: '180 lbs' },
    { label: 'Run', value: '11.32 miles' },
    { label: 'Typing 30s', value: '95 wpm' },
    { label: 'Typing 15s', value: '103.13 wpm' },
  ];

  return (
    <section id="stats" className={COMPONENT_STYLES.section.base} aria-label="Stats section">
      <div className={COMPONENT_STYLES.section.container}>
        <h2 className="text-2xl font-black text-black dark:text-white mb-8 tracking-[0.4em] uppercase" style={{ 
          fontFamily: '"Courier New", monospace',
          fontSize: '1.5rem',
          fontWeight: '900',
          letterSpacing: '0.4em',
          textTransform: 'uppercase'
        }}>STATS</h2>
        
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-black dark:text-white text-sm font-bold" style={{ 
                fontFamily: '"Courier New", monospace',
                fontSize: '0.875rem',
                fontWeight: '700',
                letterSpacing: '0.2em'
              }}>
                {stat.label}
              </span>
              <span className="text-black dark:text-white text-sm font-bold" style={{ 
                fontFamily: '"Courier New", monospace',
                fontSize: '0.875rem',
                fontWeight: '700',
                letterSpacing: '0.2em'
              }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
