/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'Menlo', 'Monaco', '"Courier New"', 'monospace'],
        sans: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        term: {
          bg: '#0c0c0c',
          surface: '#141414',
          'surface-2': '#1a1a1a',
          border: '#2a2a2a',
          text: '#e4e4e4',
          dim: '#6b6b6b',
          muted: '#444444',
          green: '#4ade80',
          cyan: '#22d3ee',
          purple: '#c084fc',
          yellow: '#fbbf24',
          red: '#f87171',
          orange: '#fb923c',
          blue: '#60a5fa',
          pink: '#f472b6',
        }
      }
    },
  },
  plugins: [],
}
