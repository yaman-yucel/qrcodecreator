import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('QRTreeScene error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white/60 p-8 text-center">
          <span className="text-5xl mb-4">⚠️</span>
          <p className="text-sm font-semibold mb-2">3D rendering failed</p>
          <p className="text-xs text-white/40 max-w-sm">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            className="mt-6 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
