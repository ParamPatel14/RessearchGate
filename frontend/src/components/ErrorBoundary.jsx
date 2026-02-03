import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-sm text-center my-8 mx-auto max-w-2xl">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-800 font-serif mb-2">Component Error</h2>
          <p className="text-stone-600 mb-6">We encountered an unexpected error while rendering this section.</p>
          
          <details className="text-left bg-white p-4 rounded-sm border border-stone-200 overflow-auto max-h-48 text-xs font-mono text-red-600 mb-6 shadow-inner">
            <summary className="cursor-pointer font-bold text-stone-500 mb-2">Technical Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[var(--color-academia-charcoal)] text-white rounded-sm hover:bg-stone-800 transition-colors shadow-sm font-medium"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
