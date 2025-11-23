"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
    children?: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 h-full flex flex-col items-center justify-center">
                    <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
                    <p className="text-sm font-mono mb-4 text-center max-w-md">{this.state.error?.message}</p>
                    <button
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-sm font-medium transition-colors"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Try again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
