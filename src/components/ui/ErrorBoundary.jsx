import React from 'react';
import Card from './Card';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">{this.state.error?.message}</p>
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 text-sm text-red-600 overflow-auto">
                  {this.state.errorInfo?.componentStack}
                </pre>
              )}
            </div>
            <div className="flex space-x-4">
              <Button onClick={this.handleReset}>
                Try Again
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;