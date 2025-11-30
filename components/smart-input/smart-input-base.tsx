/**
 * SmartInputBase Component
 *
 * Base wrapper component that provides the underlying input field functionality
 * with proper cursor management, focus handling, and accessibility features.
 */

import React, { useRef, useImperativeHandle, forwardRef, useCallback, useEffect } from "react"
import { clsx } from "clsx"
import { SmartInputBaseProps } from "@/types/smart-input"

/**
 * SmartInputBase component that wraps the actual input element
 *
 * This component handles:
 * - Text input with transparent styling for overlay rendering
 * - Cursor position tracking and management
 * - Focus and blur event handling
 * - Accessibility attributes
 * - Form integration support
 */
export const SmartInputBase = forwardRef<HTMLInputElement, SmartInputBaseProps>(
	(
		{
			value,
			onChange,
			onCursorPositionChange,
			onSelectionChange,
			onFocus,
			onBlur,
			onKeyDown,
			className,
			disabled,
			placeholder,
			"aria-label": ariaLabel,
			"aria-describedby": ariaDescribedBy,
			"aria-invalid": ariaInvalid,
			"aria-required": ariaRequired,
			id,
			name,
			autoComplete,
			...props
		},
		ref
	) => {
		const inputRef = useRef<HTMLInputElement>(null)

		// Expose input ref to parent component
		useImperativeHandle(ref, () => inputRef.current!, [])

		/**
		 * Handle input value changes
		 */
		const handleChange = useCallback(
			(event: React.ChangeEvent<HTMLInputElement>) => {
				// Pass the React event directly to maintain standard input behavior
				onChange(event)

				// Track cursor position after change
				if (onCursorPositionChange) {
					// Use setTimeout to get cursor position after React updates
					setTimeout(() => {
						if (inputRef.current) {
							onCursorPositionChange(inputRef.current.selectionStart || 0)
						}
					}, 0)
				}
			},
			[onChange, onCursorPositionChange]
		)

		/**
		 * Handle focus events
		 */
		const handleFocus = useCallback(
			(event: React.FocusEvent<HTMLInputElement>) => {
				onFocus?.(event)

				// Track initial cursor position on focus
				if (onCursorPositionChange) {
					setTimeout(() => {
						if (inputRef.current) {
							onCursorPositionChange(inputRef.current.selectionStart || 0)
						}
					}, 0)
				}
			},
			[onFocus, onCursorPositionChange]
		)

		/**
		 * Handle blur events
		 */
		const handleBlur = useCallback(
			(event: React.FocusEvent<HTMLInputElement>) => {
				onBlur?.(event)
			},
			[onBlur]
		)

		/**
		 * Handle key down events and track cursor position
		 */
		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLInputElement>) => {
				onKeyDown?.(event)

				// Track cursor position after key events that might move cursor
				const cursorMovingKeys = ["ArrowLeft", "ArrowRight", "Home", "End", "Backspace", "Delete"]

				if (cursorMovingKeys.includes(event.key)) {
					setTimeout(() => {
						if (inputRef.current && onCursorPositionChange) {
							onCursorPositionChange(inputRef.current.selectionStart || 0)
						}
						if (inputRef.current && onSelectionChange) {
							onSelectionChange(
								inputRef.current.selectionStart || 0,
								inputRef.current.selectionEnd || 0
							)
						}
					}, 0)
				}
			},
			[onKeyDown, onCursorPositionChange, onSelectionChange]
		)

		/**
		 * Handle mouse clicks and selection changes
		 */
		const handleClick = useCallback(() => {
			if (inputRef.current && onCursorPositionChange) {
				onCursorPositionChange(inputRef.current.selectionStart || 0)
			}
			if (inputRef.current && onSelectionChange) {
				onSelectionChange(inputRef.current.selectionStart || 0, inputRef.current.selectionEnd || 0)
			}
		}, [onCursorPositionChange, onSelectionChange])

		/**
		 * Handle selection changes (for mouse drag selection)
		 */
		const handleSelect = useCallback(() => {
			if (inputRef.current && onSelectionChange) {
				onSelectionChange(inputRef.current.selectionStart || 0, inputRef.current.selectionEnd || 0)
			}
		}, [onSelectionChange])

		/**
		 * Set cursor position programmatically
		 */
		const setCursorPosition = useCallback(
			(position: number) => {
				if (inputRef.current) {
					inputRef.current.setSelectionRange(position, position)
					if (onCursorPositionChange) {
						onCursorPositionChange(position)
					}
				}
			},
			[onCursorPositionChange]
		)

		/**
		 * Set text selection programmatically
		 */
		const setSelection = useCallback(
			(start: number, end: number) => {
				if (inputRef.current) {
					inputRef.current.setSelectionRange(start, end)
					if (onSelectionChange) {
						onSelectionChange(start, end)
					}
				}
			},
			[onSelectionChange]
		)

		/**
		 * Focus the input programmatically
		 */
		const focusInput = useCallback(() => {
			inputRef.current?.focus()
		}, [])

		/**
		 * Blur the input programmatically
		 */
		const blurInput = useCallback(() => {
			inputRef.current?.blur()
		}, [])

		// Expose utility methods via ref
		useEffect(() => {
			if (inputRef.current) {
				// Add utility methods to the input element
				;(inputRef.current as any).setCursorPosition = setCursorPosition
				;(inputRef.current as any).setSelection = setSelection
				;(inputRef.current as any).focusInput = focusInput
				;(inputRef.current as any).blurInput = blurInput
			}
		}, [setCursorPosition, setSelection, focusInput, blurInput])

		return (
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				onClick={handleClick}
				onSelect={handleSelect}
				disabled={disabled}
				placeholder={placeholder}
				className={clsx(
					// Base input styling matching plain-input.tsx
					"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
					"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
					"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
					// Make text transparent so overlay can show styled text
					"text-transparent caret-black dark:caret-white",
					// Ensure proper z-index for cursor visibility
					"relative z-10",
					// Use monospace font for consistent character widths
					"font-mono",
					className
				)}
				// Accessibility attributes
				aria-label={ariaLabel}
				aria-describedby={ariaDescribedBy}
				aria-invalid={ariaInvalid}
				aria-required={ariaRequired}
				// Form integration
				id={id}
				name={name}
				autoComplete={autoComplete}
				// Additional props
				{...props}
			/>
		)
	}
)

SmartInputBase.displayName = "SmartInputBase"

/**
 * Extended interface for the input element with utility methods
 */
export interface SmartInputElement extends HTMLInputElement {
	setCursorPosition: (position: number) => void
	setSelection: (start: number, end: number) => void
	focusInput: () => void
	blurInput: () => void
}

export default SmartInputBase
