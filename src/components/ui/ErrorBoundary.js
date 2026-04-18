import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });

    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    // Example: logErrorToService(error, errorInfo, errorId);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
  }

  handleReportError = () => {
    // In a real app, this could send error details to your backend
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // For now, just log to console
    console.error('Error Report:', errorDetails);

    // You could also copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. You can paste them when reporting the issue.');
      })
      .catch(() => {
        alert('Error details logged to console. Please check the developer tools.');
      });
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div style={{
          background: '#141414',
          border: '1px solid #f87171',
          borderRadius: '2px',
          padding: '1.5rem',
          maxWidth: '560px',
          margin: '2rem auto',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '13px',
        }}>
          <div style={{ color: '#f87171', marginBottom: '8px' }}>
            <span style={{ color: '#4ade80' }}>❯</span>{' '}
            <span style={{ color: '#22d3ee' }}>error</span>
            {' ─ '}
            <span style={{ color: '#f87171' }}>something went wrong</span>
          </div>

          {isDevelopment && this.state.error && (
            <details style={{ margin: '12px 0' }}>
              <summary style={{ color: '#6b6b6b', cursor: 'pointer', marginBottom: '6px' }}>
                stack trace
              </summary>
              <pre style={{
                color: '#f87171',
                fontSize: '11px',
                overflowX: 'auto',
                background: '#0c0c0c',
                padding: '10px',
                border: '1px solid #2a2a2a',
                borderRadius: '2px',
                lineHeight: 1.5,
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              onClick={this.handleRetry}
              aria-label="Retry"
              style={{
                padding: '4px 14px',
                border: '1px solid #4ade80',
                borderRadius: '2px',
                background: 'transparent',
                color: '#4ade80',
                fontFamily: 'inherit',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              [retry]
            </button>
            {isDevelopment && (
              <button
                onClick={this.handleReportError}
                aria-label="Copy error details"
                style={{
                  padding: '4px 14px',
                  border: '1px solid #2a2a2a',
                  borderRadius: '2px',
                  background: 'transparent',
                  color: '#6b6b6b',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                [copy details]
              </button>
            )}
          </div>

          <p style={{ color: '#444', fontSize: '10px', marginTop: '10px' }}>
            id: {this.state.errorId}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;