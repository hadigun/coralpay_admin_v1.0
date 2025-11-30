/**
 * SmartTextareaBase Component
 *
 * Base wrapper component that provides the underlying textarea functionality
 * with proper cursor management, focus handling, and accessibility features.
 */

import React, { useRef, useImperativeHandle, forwardRef, useCallback, useEffect } from "react"
import { clsx } from "clsx"

interface SmartTextareaBaseProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
	value: string
	onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
	onCursorPositionChange?: (position: number) => void
	onSelectionChange?: (start: number, end: number) => void
	className?: string
}

/**
 * SmartTextareaBase component that wraps the actual textarea element
 */
export const SmartTextareaBase = forwardRef<HTMLTextAreaElement, SmartTextareaBaseProps>(
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
			rows = 3,
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
		const textareaRef = useRef<HTMLTextAreaElement>(null)

		// Expose textarea ref to parent component
		useImperativeHandle(ref, () => textareaRef.current!, [])

		/**
		 * Handle textarea value changes
		 */
		const handleChange = useCallback(
			(event: React.ChangeEvent<HTMLTextAreaElement>) => {
				// Pass the React event directly to maintain standard textarea behavior
				onChange(event)

				// Track cursor position after change
				if (onCursorPositionChange) {
					setTimeout(() => {
						if (textareaRef.current) {
							onCursorPositionChange(textareaRef.current.selectionStart || 0)
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
			(event: React.FocusEvent<HTMLTextAreaElement>) => {
				onFocus?.(event)

				// Track initial cursor position on focus
				if (onCursorPositionChange) {
					setTimeout(() => {
						if (textareaRef.current) {
							onCursorPositionChange(textareaRef.current.selectionStart || 0)
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
			(event: React.FocusEvent<HTMLTextAreaElement>) => {
				onBlur?.(event)
			},
			[onBlur]
		)

		/**
		 * Handle key down events and track cursor position
		 */
		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
				onKeyDown?.(event)

				// Track cursor position after key events that might move cursor
				const cursorMovingKeys = [
					"ArrowLeft",
					"ArrowRight",
					"ArrowUp",
					"ArrowDown",
					"Home",
					"End",
					"Backspace",
					"Delete",
				]

				if (cursorMovingKeys.includes(event.key)) {
					setTimeout(() => {
						if (textareaRef.current && onCursorPositionChange) {
							onCursorPositionChange(textareaRef.current.selectionStart || 0)
						}
						if (textareaRef.current && onSelectionChange) {
							onSelectionChange(
								textareaRef.current.selectionStart || 0,
								textareaRef.current.selectionEnd || 0
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
			if (textareaRef.current && onCursorPositionChange) {
				onCursorPositionChange(textareaRef.current.selectionStart || 0)
			}
			if (textareaRef.current && onSelectionChange) {
				onSelectionChange(
					textareaRef.current.selectionStart || 0,
					textareaRef.current.selectionEnd || 0
				)
			}
		}, [onCursorPositionChange, onSelectionChange])

		/**
		 * Handle selection changes (for mouse drag selection)
		 */
		const handleSelect = useCallback(() => {
			if (textareaRef.current && onSelectionChange) {
				onSelectionChange(
					textareaRef.current.selectionStart || 0,
					textareaRef.current.selectionEnd || 0
				)
			}
		}, [onSelectionChange])

		return (
			<textarea
				ref={textareaRef}
				value={value}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				onClick={handleClick}
				onSelect={handleSelect}
				disabled={disabled}
				placeholder={placeholder}
				rows={rows}
				className={clsx(
					// Base textarea styling
					"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
					"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
					"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
					// Make text transparent so overlay can show styled text
					"text-transparent caret-black dark:caret-white",
					// Ensure proper z-index for cursor visibility
					"relative z-10",
					// Use monospace font for consistent character widths
					"font-mono resize-none",
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

SmartTextareaBase.displayName = "SmartTextareaBase"

export default SmartTextareaBase
