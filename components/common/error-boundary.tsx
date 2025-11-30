import  { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
	children: ReactNode
}

interface State {
	hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	}

	public static getDerivedStateFromError(_: Error): State {
		return { hasError: true }
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo)
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className="gap-2 flex flex-col items-center justify-center h-screen bg-gray-100">
					<h1 className="text-3xl font-bold">Oops!</h1>
					<p className="text-center mb-2">
						Something went wrong. We're working on it.
					</p>
					<button
						className="px-6 py-3 font-semibold text-white bg-black rounded-md hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
						onClick={() => window.location.reload()}
					>
						Reload Page
					</button>
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
