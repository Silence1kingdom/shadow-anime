import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ color: '#f43f5e', marginBottom: 16 }}>Something went wrong</h2>
          <pre style={{ color: '#94a3b8', fontSize: 13, maxWidth: 600, margin: '0 auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
          </pre>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 24px', border: 'none', borderRadius: 8, background: '#8b5cf6', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
