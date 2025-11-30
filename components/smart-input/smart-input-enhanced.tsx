/**
 * Enhanced SmartInput Component with Error Handling
 *
 * Main component that integrates all SmartInput functionality including:
 * - Text parsing and visual rendering
 * - Environment variable suggestions
 * - Keyboard navigation and accessibility
 * - Form integration and standard input props
 * - Performance optimizations with debouncing and memoization
 * - Comprehensive error handling and graceful degradation
 */

"use client"

import React, { forwardRef, useId, useMemo, useCallback, useEffect, useRef } from "react"
import { clsx } from "clsx"
import { SmartInputProps } from "@/types/smart-input"
import { useSmartInput } from "@/hooks/use-smart-input"
import { SmartInputBase } from "./smart-input-base"
import { SmartInputRendererMemo } from "./smart-input-renderer"
import { EnvironmentSuggestions } from "./environment-suggestions"

import { SmartInputErrorBoundary } from "./smart-input-error-boundary"
import {
	handleUndefinedVariables,
	sanitizeInputText,
	DEFAULT_ERROR_CONFIG,
	ErrorHandlerConfig,
} from "@/lib/smart-input-error-handling"

/**
 * Enhanced SmartInput component with comprehensive error handling
 */
export const SmartInputEnhanced = forwardRef<
	HTMLInputElement,
	SmartInputProps & { errorConfig?: ErrorHandlerConfig }
>(
	(
		{
			value,
			onChange,
			variables = {},
			placeholder,
			disabled = false,
			className,
			onFocus,
			onBlur,
			variableStyle,
			invalidVariableStyle,
			errorConfig = DEFAULT_ERROR_CONFIG,
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

		// Safe execution wrapper
		const safeExecute = useCallback(
			function <T>(operation: () => T, fallbackValue: T, context?: string): T {
				try {
					return operation()
				} catch (error) {
					if (errorConfig.enableLogging) {
						console.error(`SmartInput Error${context ? ` (${context})` : ""}:`, error)
					}
					return fallbackValue
				}
			},
			[errorConfig.enableLogging]
		)

		// Safely handle variables prop with error handling
		const memoizedVariables = useMemo(() => {
			return safeExecute(
				() => handleUndefinedVariables(variables, errorConfig),
				{},
				"variables processing"
			)
		}, [variables, errorConfig, safeExecute])

		// Safely sanitize input value
		const sanitizedValue = useMemo(() => {
			return safeExecute(
				() => {
					const { sanitizedText, warnings } = sanitizeInputText(value, errorConfig)
					if (warnings.length > 0 && errorConfig.enableLogging) {
						console.warn("SmartInput: Input sanitization warnings:", warnings)
					}
					return sanitizedText
				},
				value,
				"input sanitization"
			)
		}, [value, errorConfig, safeExecute])

		// Main hook that provides all functionality with error handling
		const smartInput = safeExecute(
			() =>
				useSmartInput({
					value: sanitizedValue,
					onChange,
					variables: memoizedVariables,
					onFocus,
					onBlur,
					errorConfig,
				}),
			{
				textSegments: [],
				hasVariables: false,
				validVariableCount: 0,
				invalidVariableCount: 0,
				showSuggestions: false,
				suggestions: [],
				selectedIndex: 0,
				searchQuery: "",
				triggerPosition: -1,
				cursorPosition: 0,
				selectionStart: 0,
				selectionEnd: 0,
				isFocused: false,
				handleInputChange: () => {},
				handleKeyDown: () => false,
				handleFocus: () => {},
				handleBlur: () => {},
				handleSelectionChange: () => {},
				handleCopy: () => {},
				handlePaste: () => {},
				handleCut: () => {},
				handleSuggestionSelect: () => {},
				closeSuggestions: () => {},
				insertVariableAtCursor: () => {},
				getCursorPosition: () => 0,
				setCursorPosition: () => {},
				getSelectedText: () => "",
				insertTextAtCursor: () => {},
				deleteSelection: () => {},
				selectAll: () => {},
				selectVariable: () => {},
				selectTextRange: () => ({}),
				isInVariable: () => false,
				getCurrentVariable: () => null,
				moveToVariableBoundary: () => {},
				undo: () => {},
				redo: () => {},
				canUndo: false,
				canRedo: false,
				updateValue: () => {},
				replaceSelection: () => {},
				inputRef: { current: null },
			},
			"smart input hook initialization"
		)

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
						<SmartInputRendererMemo
							segments={smartInput.textSegments}
							variableStyle={variableStyle}
							invalidVariableStyle={invalidVariableStyle}
							className="z-0"
							inputRef={smartInput.inputRef}
						/>

						{/* Base input field */}
						<SmartInputBase
							ref={ref || smartInput.inputRef}
							value={sanitizedValue}
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

SmartInputEnhanced.displayName = "SmartInputEnhanced"

/**
 * SmartInput with Error Boundary wrapper
 */
export const SmartInputWithErrorBoundary = forwardRef<
	HTMLInputElement,
	SmartInputProps & { errorConfig?: ErrorHandlerConfig }
>((props, ref) => (
	<SmartInputErrorBoundary>
		<SmartInputEnhanced {...props} ref={ref} />
	</SmartInputErrorBoundary>
))

SmartInputWithErrorBoundary.displayName = "SmartInputWithErrorBoundary"

export default SmartInputEnhanced
