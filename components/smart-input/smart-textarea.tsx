/**
 * SmartTextarea Component
 *
 * Textarea version of SmartInput with environment variable suggestions and visual formatting
 */

"use client"

import React, { forwardRef, useId, useMemo, useEffect, useRef } from "react"
import { clsx } from "clsx"
import { SmartInputProps } from "@/types/smart-input"
import { useSmartInput } from "@/hooks/use-smart-input"
import { SmartTextareaBase } from "./smart-textarea-base"
import { SmartInputRenderer } from "./smart-input-renderer"
import { EnvironmentSuggestions } from "./environment-suggestions"

const DEFAULT_VARIABLES = {}

// Extend SmartInputProps to include textarea-specific props
interface SmartTextareaProps extends Omit<SmartInputProps, "onChange"> {
	onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
	rows?: number
}

/**
 * SmartTextarea component with environment variable suggestions and visual formatting
 */
export const SmartTextarea = forwardRef<HTMLTextAreaElement, SmartTextareaProps>(
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
			rows = 3,
			// Standard textarea props
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
		const textareaId = id || `smart-textarea-${componentId}`
		const suggestionsId = `${textareaId}-suggestions`

		// Memoize variables object to prevent unnecessary re-renders
		const memoizedVariables = useMemo(() => variables, [variables])

		// Convert textarea onChange to input onChange for the hook
		const handleInputChange = useMemo(() => {
			return (event: React.ChangeEvent<HTMLInputElement>) => {
				// Create a synthetic textarea event from the input event
				const textareaEvent = {
					...event,
					target: event.target as unknown as EventTarget & HTMLTextAreaElement,
					currentTarget: event.currentTarget as unknown as EventTarget & HTMLTextAreaElement,
				} as React.ChangeEvent<HTMLTextAreaElement>

				onChange(textareaEvent)
			}
		}, [onChange])

		// Main hook that provides all functionality
		const smartInput = useSmartInput({
			value,
			onChange: handleInputChange,
			variables: memoizedVariables,
			onFocus: onFocus as any,
			onBlur: onBlur as any,
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
					inputId={textareaId}
					emptyMessage="No matching variables"
					noVariablesMessage="No variables available"
				>
					{/* Container for textarea and overlay */}
					<div className="relative">
						{/* Visual renderer overlay */}
						<SmartInputRenderer
							segments={smartInput.textSegments}
							variableStyle={variableStyle}
							invalidVariableStyle={invalidVariableStyle}
							className="z-0 h-full"
							inputRef={smartInput.inputRef}
						/>

						{/* Base textarea field */}
						<SmartTextareaBase
							ref={ref || (smartInput.inputRef as any)}
							value={value}
							onChange={(e) => {
								// Convert textarea event to input event for the hook
								const inputEvent = {
									...e,
									target: e.target as unknown as EventTarget & HTMLInputElement,
									currentTarget: e.currentTarget as unknown as EventTarget & HTMLInputElement,
								} as React.ChangeEvent<HTMLInputElement>

								smartInput.handleInputChange(inputEvent)
							}}
							onCursorPositionChange={() => {
								// Update cursor position in smart input hook
								// This is handled internally by the hook
							}}
							onSelectionChange={smartInput.handleSelectionChange}
							onFocus={smartInput.handleFocus as any}
							onBlur={smartInput.handleBlur as any}
							onKeyDown={smartInput.handleKeyDown as any}
							onCopy={smartInput.handleCopy as any}
							onPaste={smartInput.handlePaste as any}
							onCut={smartInput.handleCut as any}
							disabled={disabled}
							placeholder={placeholder}
							rows={rows}
							className={clsx("relative z-10", className)}
							// Accessibility attributes
							id={textareaId}
							name={name}
							autoComplete={autoComplete}
							required={required}
							aria-label={ariaLabel || "Smart textarea with environment variable suggestions"}
							aria-describedby={combinedAriaDescribedBy}
							aria-invalid={ariaInvalid}
							aria-required={ariaRequired || required}
							// Combobox ARIA attributes for suggestions
							role="combobox"
							aria-expanded={smartInput.showSuggestions}
							aria-haspopup="listbox"
							aria-autocomplete="list"
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

SmartTextarea.displayName = "SmartTextarea"

export default SmartTextarea
