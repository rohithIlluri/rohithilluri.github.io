import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Lazy load components for better performance with prefetch
const Hero = lazy(() => import("./components/sections/Hero"));
const Skills = lazy(() => import("./components/sections/Skills"));
const Projects = lazy(() => import("./components/sections/Projects"));
const Footer = lazy(() => import("./components/layout/Footer"));
const TopNav = lazy(() => import("./components/layout/TopNav"));

// Enhanced features components
const Music = lazy(() => import("./components/sections/Music"));
const FavoriteMovies = lazy(() => import("./components/sections/FavoriteMovies"));
// const GitHubStats = lazy(() => import("./components/sections/GitHubStats"));
const Stats = lazy(() => import("./components/sections/Stats"));

// Optimized loading component
const LoadingSpinner = () => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 text-center text-gray-900 dark:text-white">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 dark:border-slate-600 border-t-gray-600 dark:border-t-slate-200 mx-auto mb-4"></div>
    <p className="text-gray-600 dark:text-slate-400">Loading...</p>
  </div>
);

function App() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize GitHub data fetching to prevent unnecessary re-fetches
  const fetchGitHubData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch repositories with caching headers
      const reposResponse = await fetch('https://api.github.com/users/rohithIlluri/repos?sort=updated&per_page=100', {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const reposData = await reposResponse.json();
      setRepos(reposData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGitHubData();
  }, [fetchGitHubData]);

  // Memoize projects component props to prevent unnecessary re-renders
  const projectsProps = useMemo(() => ({
    repos,
    loading,
    error
  }), [repos, loading, error]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <main className="py-6 xl:py-8 relative pb-12 sm:pb-16 lg:pb-8 xl:pb-12" role="main">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="h-16" />}> 
            <TopNav />
          </Suspense>
          <div className="space-y-8">
            <Routes>
              <Route
                path="/"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ErrorBoundary>
                      <Hero />
                      {/* Keep rest of home sections */}
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
                  <Suspense fallback={<LoadingSpinner />}>
                    <ErrorBoundary>
                      <section aria-label="Projects">
                        <Projects {...projectsProps} />
                      </section>
                    </ErrorBoundary>
                  </Suspense>
                }
              />
            </Routes>
          </div>
        </div>
      </main>

      <Suspense fallback={
        <div className="bg-white dark:bg-slate-800 p-8 text-center border-t border-gray-200 dark:border-slate-700 transition-colors duration-300">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 dark:border-slate-600 border-t-gray-600 dark:border-t-slate-200 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading footer...</p>
        </div>
      }>
        <Footer />
      </Suspense>
    </div>
  );
}

export default App;