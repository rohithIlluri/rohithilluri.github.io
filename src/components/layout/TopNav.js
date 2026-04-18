import React, { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navLinkStyle = (isActive) => ({
  padding: '2px 10px',
  fontSize: '12px',
  color: isActive ? '#0c0c0c' : '#6b6b6b',
  background: isActive ? '#4ade80' : 'transparent',
  border: '1px solid',
  borderColor: isActive ? '#4ade80' : '#2a2a2a',
  borderRadius: '2px',
  textDecoration: 'none',
  fontFamily: 'inherit',
  transition: 'all 120ms',
  cursor: 'pointer',
});

const TopNav = () => {
  const location = useLocation();
  const cwd =
    location.pathname === '/terminal' ? '~/terminal' :
    location.pathname === '/projects'  ? '~/projects'  : '~';

  return (
    <nav
      aria-label="Primary navigation"
      style={{
        borderBottom: '1px solid #2a2a2a',
        padding: '10px 0',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        fontFamily: 'inherit',
      }}
    >
      {/* Prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ color: '#c084fc', fontWeight: 600 }}>rohith</span>
        <span style={{ color: '#444' }}>@</span>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>portfolio</span>
        <span style={{ color: '#444', margin: '0 4px' }}>·</span>
        <span style={{ color: '#c084fc' }}>{cwd}</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <NavLink to="/" end style={({ isActive }) => navLinkStyle(isActive)}>
          home
        </NavLink>
        <NavLink to="/projects" style={({ isActive }) => navLinkStyle(isActive)}>
          projects
        </NavLink>
        <NavLink to="/terminal" style={({ isActive }) => navLinkStyle(isActive)}>
          terminal
        </NavLink>
      </div>
    </nav>
  );
};

export default memo(TopNav);
