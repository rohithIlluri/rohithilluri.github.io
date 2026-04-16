import React from 'react';
import Terminal from './components/Terminal';
import ErrorBoundary from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Terminal />
    </ErrorBoundary>
  );
}
