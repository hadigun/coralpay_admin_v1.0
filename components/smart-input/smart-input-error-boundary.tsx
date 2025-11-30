/**
 * Error Boundary component for Smart Input
 * Provides graceful error handling and fallback UI
 */

"use client"

import React, { Component, ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
	generateErrorBoundaryFallback,
	ErrorBoundaryFallbackProps,
} from "@/lib/smart-input-error-handling"

interface SmartInputErrorBoundaryState {
	hasError: boolean
	error: Error | null
	errorInfo: React.ErrorInfo | null
	retryCount: number
}

interface SmartInputErrorBoundaryProps {
	children: ReactNode
	fallbackComponent?: React.ComponentType<ErrorBoundaryFallbackProps>
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void
	maxRetries?: number
	enableLogging?: boolean
}

/**
 * Default fallback component for error boundary
 */
const DefaultErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({
	error,
	resetError,
	componentName,
}) => {
	const fallbackData = generateErrorBoundaryFallback(error, componentName)

	return (
		<Alert variant="destructive" className="max-w-md">
			<AlertTitle>{fallbackData.title}</AlertTitle>
			<AlertDescription className="space-y-2">
				<p>{fallbackData.message}</p>

				<div className="space-y-1">
					<p className="font-medium text-sm">Suggestions:</p>
					<ul className="text-sm space-y-1">
						{fallbackData.suggestions.map((suggestion, index) => (
							<li key={index} className="flex items-start">
								<span className="mr-2">•</span>
								<span>{suggestion}</span>
							</li>
						))}
					</ul>
				</div>

				{fallbackData.canRecover && (
					<Button onClick={resetError} variant="outline" size="sm" className="mt-3">
						Try Again
					</Button>
				)}
			</AlertDescription>
		</Alert>
	)
}

/**
 * Error boundary component for Smart Input
 */
export class SmartInputErrorBoundary extends Component<
	SmartInputErrorBoundaryProps,
	SmartInputErrorBoundaryState
> {
	private retryTimeoutId: NodeJS.Timeout | null = null

	constructor(props: SmartInputErrorBoundaryProps) {
		super(props)

		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
			retryCount: 0,
		}
	}

	static getDerivedStateFromError(error: Error): Partial<SmartInputErrorBoundaryState> {
		return {
			hasError: true,
			error,
		}
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		const { onError, enableLogging = true } = this.props

		// Log error if logging is enabled
		if (enableLogging) {
			console.error("SmartInput Error Boundary caught an error:", error)
			console.error("Error Info:", errorInfo)
		}

		// Update state with error info
		this.setState({
			errorInfo,
		})

		// Call custom error handler if provided
		onError?.(error, errorInfo)
	}

	componentWillUnmount() {
		if (this.retryTimeoutId) {
			clearTimeout(this.retryTimeoutId)
		}
	}

	resetError = () => {
		const { maxRetries = 3 } = this.props
		const { retryCount } = this.state

		if (retryCount >= maxRetries) {
			console.warn(`SmartInput: Maximum retry attempts (${maxRetries}) reached`)
			return
		}

		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
			retryCount: retryCount + 1,
		})

		// Auto-reset retry count after successful render
		this.retryTimeoutId = setTimeout(() => {
			this.setState({ retryCount: 0 })
		}, 5000)
	}

	render() {
		const { hasError, error, retryCount } = this.state
		const { children, fallbackComponent: FallbackComponent, maxRetries = 3 } = this.props

		if (hasError && error) {
			// Show different message if max retries reached
			if (retryCount >= maxRetries) {
				return (
					<Alert variant="destructive" className="max-w-md">
						<AlertTitle>SmartInput Unavailable</AlertTitle>
						<AlertDescription>
							<p>
								The SmartInput component has encountered repeated errors and is temporarily
								unavailable. Please refresh the page or contact support.
							</p>
							<p className="text-sm mt-2 opacity-75">Error: {error.message}</p>
						</AlertDescription>
					</Alert>
				)
			}

			// Use custom fallback component if provided
			if (FallbackComponent) {
				return (
					<FallbackComponent
						error={error}
						resetError={this.resetError}
						componentName="SmartInput"
					/>
				)
			}

			// Use default fallback component
			return (
				<DefaultErrorFallback
					error={error}
					resetError={this.resetError}
					componentName="SmartInput"
				/>
			)
		}

		return children
	}
}

/**
 * Higher-order component to wrap components with error boundary
 */
export const withSmartInputErrorBoundary = <P extends object>(
	WrappedComponent: React.ComponentType<P>,
	errorBoundaryProps?: Omit<SmartInputErrorBoundaryProps, "children">
) => {
	const WithErrorBoundary = (props: P) => (
		<SmartInputErrorBoundary {...errorBoundaryProps}>
			<WrappedComponent {...props} />
		</SmartInputErrorBoundary>
	)

	WithErrorBoundary.displayName = `withSmartInputErrorBoundary(${
		WrappedComponent.displayName || WrappedComponent.name
	})`

	return WithErrorBoundary
}

/**
 * Hook to provide error boundary functionality to functional components
 */
export const useSmartInputErrorHandler = (
	onError?: (error: Error) => void,
	enableLogging: boolean = true
) => {
	const handleError = React.useCallback(
		(error: Error, context?: string) => {
			if (enableLogging) {
				console.error(`SmartInput Error${context ? ` (${context})` : ""}:`, error)
			}

			onError?.(error)
		},
		[onError, enableLogging]
	)

	const safeExecute = React.useCallback(
		function <T>(operation: () => T, fallbackValue: T, context?: string): T {
			try {
				return operation()
			} catch (error) {
				handleError(error instanceof Error ? error : new Error(String(error)), context)
				return fallbackValue
			}
		},
		[handleError]
	)

	return {
		handleError,
		safeExecute,
	}
}

export default SmartInputErrorBoundary
