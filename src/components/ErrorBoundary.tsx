'use client'

import React, { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
              <h1 className="text-2xl font-semibold text-white mb-2">Something went wrong</h1>
              <p className="text-gray-400 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
