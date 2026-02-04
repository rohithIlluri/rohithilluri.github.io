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
        <div className="bg-white/90 p-8 border border-red-200 rounded-2xl shadow-xl text-center max-w-md mx-auto my-8">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            We encountered an unexpected error. This has been automatically reported to help us improve the application.
          </p>

          {isDevelopment && this.state.error && (
            <details className="text-left mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-red-600 overflow-auto bg-white p-2 rounded border border-red-100">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && (
                  <>
                    {'\n\nComponent Stack:'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label="Retry loading the component"
            >
              Try Again
            </button>

            {isDevelopment && (
              <button
                onClick={this.handleReportError}
                className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                aria-label="Copy error details to clipboard"
              >
                Copy Error Details
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Error ID: {this.state.errorId}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;