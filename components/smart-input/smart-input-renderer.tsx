/**
 * SmartInputRenderer Component
 *
 * Provides visual rendering of text segments with styled environment variable references.
 * Uses an overlay approach to render styled text segments over the input field.
 */

import React, { useEffect, useState, useRef } from "react"
import { clsx } from "clsx"
import { SmartInputRendererProps, TextSegment } from "@/types/smart-input"
import { DEFAULT_VARIABLE_STYLE, DEFAULT_INVALID_VARIABLE_STYLE } from "@/lib/smart-input-constants"

/**
 * SmartInputRenderer component for styled text display
 *
 * This component creates an overlay that renders styled text segments
 * while maintaining proper alignment with the underlying input field.
 * It tracks the input's scroll position to keep the overlay synchronized.
 */
export const SmartInputRenderer: React.FC<SmartInputRendererProps> = ({
	segments,
	variableStyle = DEFAULT_VARIABLE_STYLE,
	invalidVariableStyle = DEFAULT_INVALID_VARIABLE_STYLE,
	className,
	inputRef,
}) => {
	const [scrollLeft, setScrollLeft] = useState(0)
	const [scrollTop, setScrollTop] = useState(0)
	const overlayRef = useRef<HTMLDivElement>(null)

	// Track input/textarea scroll position to sync overlay
	useEffect(() => {
		const inputElement = inputRef?.current
		if (!inputElement) return

		let rafId: number | null = null

		const handleScroll = () => {
			// Use requestAnimationFrame to throttle scroll updates for better performance
			if (rafId) {
				cancelAnimationFrame(rafId)
			}

			rafId = requestAnimationFrame(() => {
				setScrollLeft(inputElement.scrollLeft)
				setScrollTop(inputElement.scrollTop)
				rafId = null
			})
		}

		// Listen for scroll events on the input
		inputElement.addEventListener("scroll", handleScroll)

		// Also listen for input events that might cause scrolling
		inputElement.addEventListener("input", handleScroll)

		// Listen for cursor position changes that might cause scrolling
		inputElement.addEventListener("keyup", handleScroll)
		inputElement.addEventListener("click", handleScroll)
		inputElement.addEventListener("focus", handleScroll)

		// Initial sync
		handleScroll()

		return () => {
			if (rafId) {
				cancelAnimationFrame(rafId)
			}
			inputElement.removeEventListener("scroll", handleScroll)
			inputElement.removeEventListener("input", handleScroll)
			inputElement.removeEventListener("keyup", handleScroll)
			inputElement.removeEventListener("click", handleScroll)
			inputElement.removeEventListener("focus", handleScroll)
		}
	}, [inputRef])

	/**
	 * Render individual text segment with appropriate styling
	 */
	const renderSegment = (segment: TextSegment) => {
		const baseClasses = "whitespace-pre"

		switch (segment.type) {
			case "variable":
				return (
					<span
						key={segment.id}
						className={clsx(baseClasses)}
						style={{
							backgroundColor: variableStyle.backgroundColor,
							fontWeight: variableStyle.fontWeight,
							fontStyle: variableStyle.fontStyle,
							color: variableStyle.textColor,
							borderRadius: variableStyle.borderRadius,
						}}
						title={`Environment variable: ${segment.variableName}`}
					>
						{segment.content}
					</span>
				)

			case "invalid-variable":
				return (
					<span
						key={segment.id}
						className={clsx(baseClasses)}
						style={{
							backgroundColor: invalidVariableStyle.backgroundColor,
							fontWeight: invalidVariableStyle.fontWeight,
							fontStyle: invalidVariableStyle.fontStyle,
							color: invalidVariableStyle.textColor,
							borderRadius: invalidVariableStyle.borderRadius,
						}}
						title={`Invalid variable: ${segment.variableName || "malformed"}`}
					>
						{segment.content}
					</span>
				)

			case "text":
			default:
				return (
					<span key={segment.id} className={baseClasses}>
						{segment.content}
					</span>
				)
		}
	}

	return (
		<div
			ref={overlayRef}
			className={clsx(
				// Match input positioning and sizing exactly
				"absolute inset-0 pointer-events-none",
				"px-3 py-2", // Match input/textarea padding exactly
				"text-base md:text-sm", // Match input font size exactly
				"min-h-9 flex items-start", // Match input height and vertical alignment, allow growth for textarea
				"overflow-hidden box-border", // Ensure consistent box model
				"font-mono", // Use monospace font for consistent character widths
				className
			)}
			aria-hidden="true" // Hide from screen readers as this is visual only
		>
			<div
				className="w-full whitespace-pre-wrap"
				style={{
					transform: `translate(-${scrollLeft}px, -${scrollTop}px)`,
					transition: "transform 0ms", // No transition for immediate sync
				}}
			>
				{segments.map(renderSegment)}
			</div>
		</div>
	)
}

/**
 * Memoized version of SmartInputRenderer for performance optimization
 */
export const SmartInputRendererMemo = React.memo(SmartInputRenderer, (prevProps, nextProps) => {
	// Custom comparison for segments array
	if (prevProps.segments.length !== nextProps.segments.length) {
		return false
	}

	// Compare each segment
	for (let i = 0; i < prevProps.segments.length; i++) {
		const prevSegment = prevProps.segments[i]
		const nextSegment = nextProps.segments[i]

		if (
			prevSegment.id !== nextSegment.id ||
			prevSegment.type !== nextSegment.type ||
			prevSegment.content !== nextSegment.content ||
			prevSegment.variableName !== nextSegment.variableName ||
			prevSegment.isValid !== nextSegment.isValid
		) {
			return false
		}
	}

	// Compare styling objects
	const prevVarStyle = prevProps.variableStyle || DEFAULT_VARIABLE_STYLE
	const nextVarStyle = nextProps.variableStyle || DEFAULT_VARIABLE_STYLE
	const prevInvalidStyle = prevProps.invalidVariableStyle || DEFAULT_INVALID_VARIABLE_STYLE
	const nextInvalidStyle = nextProps.invalidVariableStyle || DEFAULT_INVALID_VARIABLE_STYLE

	if (
		JSON.stringify(prevVarStyle) !== JSON.stringify(nextVarStyle) ||
		JSON.stringify(prevInvalidStyle) !== JSON.stringify(nextInvalidStyle) ||
		prevProps.className !== nextProps.className ||
		prevProps.inputRef !== nextProps.inputRef
	) {
		return false
	}

	return true
})

SmartInputRendererMemo.displayName = "SmartInputRendererMemo"

export default SmartInputRenderer
