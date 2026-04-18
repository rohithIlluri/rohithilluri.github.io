import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';
import useYouTubePlayer from './hooks/useYouTubePlayer';
import NowPlaying from './components/ui/NowPlaying';

const Hero = lazy(() => import("./components/sections/Hero"));
const Skills = lazy(() => import("./components/sections/Skills"));
const Projects = lazy(() => import("./components/sections/Projects"));
const Terminal = lazy(() => import("./components/sections/Terminal"));
const Footer = lazy(() => import("./components/layout/Footer"));
const TopNav = lazy(() => import("./components/layout/TopNav"));
const Music = lazy(() => import("./components/sections/Music"));
const FavoriteMovies = lazy(() => import("./components/sections/FavoriteMovies"));
const Stats = lazy(() => import("./components/sections/Stats"));

const LoadingLine = () => (
  <div style={{ color: '#6b6b6b', fontSize: '13px', padding: '6px 0' }}>
    <span style={{ color: '#4ade80' }}>❯</span>{' '}
    <span style={{ color: '#22d3ee' }}>loading</span>
    <span style={{ color: '#4ade80' }} className="term-cursor" />
  </div>
);

function App() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack } = useYouTubePlayer();

  const fetchGitHubData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        'https://api.github.com/users/rohithIlluri/repos?sort=updated&per_page=100',
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );
      if (!res.ok) throw new Error('Failed to fetch repositories');
      setRepos(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGitHubData(); }, [fetchGitHubData]);

  const projectsProps = useMemo(() => ({ repos, loading, error }), [repos, loading, error]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0c0c0c', color: '#e4e4e4' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 20px' }}>
        <Suspense fallback={<div style={{ height: '52px' }} />}>
          <TopNav />
        </Suspense>

        <main role="main" style={{ paddingBottom: '3rem' }}>
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<LoadingLine />}>
                  <ErrorBoundary>
                    <Hero />
                    <Skills />
                    <Music />
                    <FavoriteMovies />
                    <Stats />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            <Route
              path="/projects"
              element={
                <Suspense fallback={<LoadingLine />}>
                  <ErrorBoundary>
                    <Projects {...projectsProps} />
                  </ErrorBoundary>
                </Suspense>
              }
            />
            <Route
              path="/terminal"
              element={
                <Suspense fallback={<LoadingLine />}>
                  <ErrorBoundary>
                    <Terminal />
                  </ErrorBoundary>
                </Suspense>
              }
            />
          </Routes>
        </main>
      </div>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <NowPlaying
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlayPause={togglePlayPause}
        onNext={nextTrack}
        onPrevious={previousTrack}
      />
    </div>
  );
}

export default App;
