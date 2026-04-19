import React, { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ui/ErrorBoundary';

const TUI = lazy(() => import('./components/sections/TUI'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <TUI />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
