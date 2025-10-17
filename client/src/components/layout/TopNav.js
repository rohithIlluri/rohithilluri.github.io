import React, { memo, useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';

const TopNav = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme to document when isDark changes with requestAnimationFrame for smooth transitions
  useEffect(() => {
    const applyTheme = () => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    };
    
    // Use requestAnimationFrame to ensure smooth theme transitions
    requestAnimationFrame(applyTheme);
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Memoize theme toggle to prevent unnecessary re-renders
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const base = 'px-4 py-2 text-sm font-medium rounded-full transition-colors';
  const active = isDark 
    ? 'bg-slate-700 text-white' 
    : 'bg-gray-800 text-white';
  const inactive = isDark 
    ? 'text-slate-200 hover:text-slate-400' 
    : 'text-gray-800 hover:text-gray-600';

  return (
    <nav className="flex justify-between items-center mb-8" aria-label="Primary">
      {/* Name on the left */}
      <div className="flex-shrink-0">
        <h1 className={`text-4xl lg:text-5xl font-bold text-black dark:text-white transition-colors duration-300`}>
          Rohith Illuri
        </h1>
        
      </div>
      
      {/* Navigation and theme toggle on the right */}
      <div className="flex items-center space-x-4">
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
        
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all duration-300 ${
            isDark 
              ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            // Sun icon for light mode toggle
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            // Moon icon for dark mode toggle
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default memo(TopNav);


