import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback" role="alert">
          <h1>Something went wrong</h1>
          <p>
            Try refreshing the page. If the problem persists, reset your progress
            from the top bar or clear site data for this domain.
          </p>
          <button type="button" onClick={() => window.location.assign('/')}>
            Back to overview
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
