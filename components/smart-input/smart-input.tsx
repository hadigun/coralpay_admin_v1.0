/**
 * SmartInput Component
 *
 * Main component that integrates all SmartInput functionality including:
 * - Text parsing and visual rendering
 * - Environment variable suggestions
 * - Keyboard navigation and accessibility
 * - Form integration and standard input props
 * - Performance optimizations with debouncing and memoization
 */

"use client"

import React, { forwardRef, useId, useMemo, useEffect, useRef } from "react"
import { clsx } from "clsx"
import { SmartInputProps } from "@/types/smart-input"
import { useSmartInput } from "@/hooks/use-smart-input"
import { SmartInputBase } from "./smart-input-base"
import { SmartInputRenderer } from "./smart-input-renderer"
import { EnvironmentSuggestions } from "./environment-suggestions"

const DEFAULT_VARIABLES = {}

/**
 * SmartInput component with environment variable suggestions and visual formatting
 *
 * Features:
 * - Autocomplete for environment variables triggered by {{
 * - Visual styling for valid/invalid variable references
 * - Full keyboard navigation and accessibility
 * - Integration with form libraries
 * - Standard input props support
 * - Performance optimizations with debouncing and memoization
 */
export const SmartInput = forwardRef<HTMLInputElement, SmartInputProps>(
	(
		{
			value,
			onChange,
			variables = DEFAULT_VARIABLES,
			placeholder,
			disabled = false,
			className,
			onFocus,
			onBlur,
			variableStyle,
			invalidVariableStyle,
			// Standard input props
			id,
			name,
			autoComplete,
			required,
			"aria-label": ariaLabel,
			"aria-describedby": ariaDescribedBy,
			"aria-invalid": ariaInvalid,
			"aria-required": ariaRequired,
			...props
		},
		ref
	) => {
		// Refs for cleanup
		const cleanupRef = useRef<(() => void)[]>([])

		// Generate unique IDs for accessibility
		const componentId = useId()
		const inputId = id || `smart-input-${componentId}`
		const suggestionsId = `${inputId}-suggestions`

		// Memoize variables object to prevent unnecessary re-renders
		const memoizedVariables = useMemo(() => variables, [variables])

		// Main hook that provides all functionality
		const smartInput = useSmartInput({
			value,
			onChange,
			variables: memoizedVariables,
			onFocus,
			onBlur,
		})

		// Memoize suggestion list for large numbers of variables
		const memoizedSuggestions = useMemo(() => {
			// For large suggestion lists, limit to top 50 results
			const maxSuggestions = 50
			return smartInput.suggestions.length > maxSuggestions
				? smartInput.suggestions.slice(0, maxSuggestions)
				: smartInput.suggestions
		}, [smartInput.suggestions])

		// Memoize aria-describedby combination
		const combinedAriaDescribedBy = useMemo(
			() => [ariaDescribedBy, suggestionsId].filter(Boolean).join(" "),
			[ariaDescribedBy, suggestionsId]
		)

		// Memoize status message for screen readers
		const statusMessage = useMemo(() => {
			if (smartInput.showSuggestions && memoizedSuggestions.length > 0) {
				return `${memoizedSuggestions.length} environment variable suggestions available`
			}
			if (smartInput.showSuggestions) {
				return "No matching environment variables"
			}
			return ""
		}, [smartInput.showSuggestions, memoizedSuggestions.length])

		// Cleanup function for debounced operations and event listeners
		useEffect(() => {
			return () => {
				// Clean up all registered cleanup functions
				cleanupRef.current.forEach((cleanup) => cleanup())
				cleanupRef.current = []
			}
		}, [])

		return (
			<div className="relative">
				{/* Environment variable suggestions popover */}
				<EnvironmentSuggestions
					isOpen={smartInput.showSuggestions}
					suggestions={memoizedSuggestions}
					selectedIndex={smartInput.selectedIndex}
					onSelect={smartInput.handleSuggestionSelect}
					onClose={smartInput.closeSuggestions}
					inputId={inputId}
					emptyMessage="No matching variables"
					noVariablesMessage="No variables available"
				>
					{/* Container for input and overlay */}
					<div className="relative">
						{/* Visual renderer overlay - using memoized version */}
						<SmartInputRenderer
							segments={smartInput.textSegments}
							variableStyle={variableStyle}
							invalidVariableStyle={invalidVariableStyle}
							className="z-0 h-full"
							inputRef={smartInput.inputRef}
						/>

						{/* Base input field */}
						<SmartInputBase
							ref={ref || smartInput.inputRef}
							value={value}
							onChange={smartInput.handleInputChange}
							onCursorPositionChange={() => {
								// Update cursor position in smart input hook
								// This is handled internally by the hook
							}}
							onSelectionChange={smartInput.handleSelectionChange}
							onFocus={smartInput.handleFocus}
							onBlur={smartInput.handleBlur}
							onKeyDown={smartInput.handleKeyDown}
							onCopy={smartInput.handleCopy}
							onPaste={smartInput.handlePaste}
							onCut={smartInput.handleCut}
							disabled={disabled}
							placeholder={placeholder}
							className={clsx("relative z-10", className)}
							// Accessibility attributes
							id={inputId}
							name={name}
							autoComplete={autoComplete}
							required={required}
							aria-label={ariaLabel || "Smart input with environment variable suggestions"}
							aria-describedby={combinedAriaDescribedBy}
							aria-invalid={ariaInvalid}
							aria-required={ariaRequired || required}
							// Combobox ARIA attributes for suggestions
							role="combobox"
							aria-expanded={smartInput.showSuggestions}
							aria-haspopup="listbox"
							aria-autocomplete="list"
							// Additional props
							{...props}
						/>
					</div>
				</EnvironmentSuggestions>

				{/* Hidden status region for screen reader announcements */}
				<div
					id={suggestionsId}
					className="sr-only"
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					{statusMessage}
				</div>
			</div>
		)
	}
)

SmartInput.displayName = "SmartInput"

/**
 * Memoized version of SmartInput for performance optimization
 * Prevents unnecessary re-renders when props haven't changed
 */
export const SmartInputMemo = React.memo(SmartInput, (prevProps, nextProps) => {
	// Custom comparison for better performance

	// Check basic props
	if (
		prevProps.value !== nextProps.value ||
		prevProps.disabled !== nextProps.disabled ||
		prevProps.placeholder !== nextProps.placeholder ||
		prevProps.className !== nextProps.className ||
		prevProps.id !== nextProps.id ||
		prevProps.name !== nextProps.name ||
		prevProps.required !== nextProps.required
	) {
		return false
	}

	// Check variables object (shallow comparison for keys)
	const prevVarKeys = Object.keys(prevProps.variables || {})
	const nextVarKeys = Object.keys(nextProps.variables || {})

	if (prevVarKeys.length !== nextVarKeys.length) {
		return false
	}

	for (const key of prevVarKeys) {
		if (prevProps.variables?.[key] !== nextProps.variables?.[key]) {
			return false
		}
	}

	// Check styling objects
	if (JSON.stringify(prevProps.variableStyle) !== JSON.stringify(nextProps.variableStyle)) {
		return false
	}

	if (
		JSON.stringify(prevProps.invalidVariableStyle) !==
		JSON.stringify(nextProps.invalidVariableStyle)
	) {
		return false
	}

	// Check ARIA attributes
	if (
		prevProps["aria-label"] !== nextProps["aria-label"] ||
		prevProps["aria-describedby"] !== nextProps["aria-describedby"] ||
		prevProps["aria-invalid"] !== nextProps["aria-invalid"] ||
		prevProps["aria-required"] !== nextProps["aria-required"]
	) {
		return false
	}

	// Function props are harder to compare, assume they're stable if other props match
	return true
})

SmartInputMemo.displayName = "SmartInputMemo"

export default SmartInput
