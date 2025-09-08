import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';

const TopNav = () => {
  const base = 'px-4 py-2 text-sm font-medium rounded-full transition-colors';
  const active = 'bg-gray-800 text-white';
  const inactive = 'text-gray-800 hover:text-gray-600';

  return (
    <nav className="flex justify-end mb-8" aria-label="Primary">
      <div className="flex space-x-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          home
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          projects
        </NavLink>
      </div>
    </nav>
  );
};

export default memo(TopNav);


