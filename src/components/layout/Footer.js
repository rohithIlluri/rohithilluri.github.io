import React, { memo } from 'react';

const Footer = () => (
  <footer
    aria-label="Footer"
    style={{
      borderTop: '1px solid #2a2a2a',
      padding: '12px 20px',
      fontSize: '11px',
      color: '#444',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '820px',
      margin: '0 auto',
    }}
  >
    <span style={{ color: '#4ade80' }}>❯</span>
    <span style={{ color: '#6b6b6b' }}>
      © {new Date().getFullYear()} rohith illuri
    </span>
    <span className="term-cursor" style={{ width: '6px', height: '12px' }} />
  </footer>
);

export default memo(Footer);
