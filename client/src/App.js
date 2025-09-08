import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Lazy load components for better performance
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

function App() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        // Fetch repositories
        const reposResponse = await fetch('https://api.github.com/users/rohithilluri/repos?sort=updated&per_page=100');
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
    };

    fetchGitHubData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="py-6 xl:py-8 relative pb-12 sm:pb-16 lg:pb-8 xl:pb-12" role="main">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div />}> 
            <TopNav />
          </Suspense>
          <div className="space-y-8">
            <Routes>
              <Route
                path="/"
                element={
                  <Suspense fallback={<div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">Loading...</div>}>
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
                  <Suspense fallback={<div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">Loading projects...</div>}>
                    <ErrorBoundary>
                      <section aria-label="Projects">
                        <Projects repos={repos} loading={loading} error={error} />
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
        <div className="bg-white p-8 text-center border-t border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading footer...</p>
        </div>
      }>
        <Footer />
      </Suspense>
    </div>
  );
}

export default App;