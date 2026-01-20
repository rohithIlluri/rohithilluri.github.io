# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern React portfolio website featuring GitHub integration, project showcase, skills display, and embedded multimedia (YouTube music player, TMDB movie favorites). Uses a glass-morphism design aesthetic with Tailwind CSS.

## Technology Stack

- **Frontend**: React 19, React Router v6
- **Styling**: Tailwind CSS with custom dark mode support (class-based)
- **Icons**: react-icons, simple-icons
- **Build**: Create React App (react-scripts 5.0.1)
- **Testing**: Jest, React Testing Library
- **Deployment**: GitHub Pages (via gh-pages)

## Common Commands

### Setup
```bash
# First time setup - installs dependencies for both root and client
npm run setup

# Or manually
npm install && cd client && npm install
```

### Development
```bash
# Start dev server (runs on default CRA port 3000)
npm run dev
# or
npm start
# or
cd client && npm start

# Access at: http://localhost:3000
```

### Testing
```bash
cd client && npm test
```

### Building
```bash
# Build production bundle
npm run build
# or
cd client && npm run build

# Output: client/build/
```

### Deployment
```bash
cd client && npm run deploy
# Builds and deploys to GitHub Pages
# Note: postbuild script copies .nojekyll to build/
```

### Cleanup
```bash
npm run clean
# Removes node_modules and build artifacts from both root and client
```

## Architecture

### Monorepo Structure
- **Root**: Contains convenience scripts that delegate to client
- **client/**: Complete React application (all source code lives here)

### Component Organization

```
client/src/
├── components/
│   ├── sections/     # Page sections (Hero, Skills, Projects, Music, etc.)
│   ├── layout/       # Layout components (TopNav, Footer, Sidebar)
│   ├── github/       # GitHub-specific components (GitHubStats, GitHubAchievements)
│   └── ui/           # Reusable UI components (ErrorBoundary)
├── constants/        # Configuration files (see Configuration System below)
├── utils/            # Helper functions (API utilities for GitHub, Spotify, TMDB)
└── assets/           # Static assets
```

### Configuration System

All customizable data lives in `client/src/constants/`:

- **projects.js**:
  - `PROJECT_REPOS`: Array of GitHub repo names to display
  - `CUSTOM_PROJECTS`: Override repo descriptions, add live URLs, screenshots

- **github.js**:
  - `GITHUB_USERNAME`: GitHub username for API calls
  - `SHOWCASE_REPOS`: Legacy, use PROJECT_REPOS instead

- **spotify.js**: Music artists configuration with Spotify IDs

- **tmdb.js**: Favorite movies configuration with TMDB IDs

- **theme.js**: `COMPONENT_STYLES` - centralized styling constants

### Data Flow

**GitHub Integration:**
- App.js fetches all repos from GitHub API on mount
- Projects component filters repos based on PROJECT_REPOS array
- Projects component fetches live data for specific repos every 5 minutes
- Custom descriptions from CUSTOM_PROJECTS override GitHub descriptions
- Live data (stars, forks, updates) merged with custom info

**Route Structure:**
- `/` - Home page with Hero, Skills, Music, FavoriteMovies, Stats
- `/projects` - Dedicated projects page with GitHub integration

### Performance Optimizations

- Lazy loading for all major components via React.lazy()
- Memoized callbacks and props in App.js
- Component-level memoization with React.memo()
- Suspense boundaries with loading states
- ErrorBoundary wraps all major sections
- GitHub API calls use caching headers

### API Integrations

**GitHub API:**
- Base URL: `https://api.github.com`
- Rate limit: 60 requests/hour (unauthenticated)
- Utils: `client/src/utils/github.js`

**Spotify API:**
- Requires `REACT_APP_SPOTIFY_CLIENT_ID` and `REACT_APP_SPOTIFY_CLIENT_SECRET` in `.env.local`
- Utils: `client/src/utils/spotify.js`

**TMDB API:**
- Requires `REACT_APP_TMDB_API_KEY` in `.env.local`
- Utils: `client/src/utils/tmdb.js`

### Environment Variables

Create `client/.env.local` for API keys (optional):
```
REACT_APP_SPOTIFY_CLIENT_ID=your-client-id
REACT_APP_SPOTIFY_CLIENT_SECRET=your-client-secret
REACT_APP_TMDB_API_KEY=your-tmdb-api-key
```

## Key Implementation Details

### Adding New Projects
1. Edit `client/src/constants/projects.js`
2. Add repo name to `PROJECT_REPOS` array (must match GitHub repo name exactly)
3. Optionally add custom description/URL in `CUSTOM_PROJECTS` object

### Styling System
- Tailwind CSS with JIT mode
- Dark mode: class-based (`class` strategy in tailwind.config.js)
- Custom colors for opacity variants (black.5, black.10, etc.)
- Component styles centralized in `COMPONENT_STYLES` (client/src/constants/theme.js)

### Port Configuration
Default port is **3000** (standard Create React App default).

### Deployment Configuration
- **homepage**: Set to `https://rohithilluri.github.io` in client/package.json
- **.nojekyll**: Copied to build folder via postbuild script (required for GitHub Pages)
- **gh-pages**: Deploys from client/build/ directory

## Testing

Tests use Jest and React Testing Library. Located in `client/src/components/__tests__/`:
- App.test.js
- Hero.test.js
- Projects.test.js
- Skills.test.js
- Contact.test.js

Run tests from client directory: `cd client && npm test`
