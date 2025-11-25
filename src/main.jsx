import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGA4 } from './services/analytics.js'

// Initialize Google Analytics 4
initGA4();

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#e5e3dc', minHeight: '100vh' }}>
          <h1 style={{ color: '#d4967d', fontSize: '24px' }}>🎧 Falls Park Tour</h1>
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h2>Loading...</h2>
            <p>If this persists, please check your browser console for errors.</p>
            <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', backgroundColor: '#d4967d', color: 'white', border: 'none', borderRadius: '4px', marginTop: '10px' }}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
