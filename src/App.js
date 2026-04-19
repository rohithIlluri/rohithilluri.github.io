import React, { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ui/ErrorBoundary';

const Terminal = lazy(() => import('./components/sections/Terminal'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Terminal />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
