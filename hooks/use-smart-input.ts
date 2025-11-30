/**
 * Main hook that combines text parsing and suggestion trigger functionality
 * Provides unified state management for all SmartInput features
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { TextSegment, SuggestionItem, SmartInputState } from "@/types/smart-input"
import { useTextParser } from "./use-text-parser"
import { useSuggestionTrigger } from "./use-suggestion-trigger"
import {
	handlePartialVariableDeletion,
	insertTextWithVariableAwareness,
	copyTextWithVariables,
	pasteTextWithVariableRecognition,
	getSmartCursorPosition,
	TextHistory,
	updateValueProgrammatically,
	handleTextSelection,
	getCursorPositionInVariable,
	isCursorInVariable,
} from "@/lib/smart-input-utils"
import {
	AdvancedTextHistory,
	getAdvancedCursorPosition,
	handleAdvancedTextSelection,
	updateValueProgrammaticallyAdvanced,
	insertTextAdvanced,
	deleteTextAdvanced,
} from "@/lib/smart-input-advanced-editing"
import {
	DEFAULT_ERROR_CONFIG,
	ErrorHandlerConfig,
	validateCursorPosition,
	safeTextManipulation,
} from "@/lib/smart-input-error-handling"

interface UseSmartInputProps {
	value: string
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
	variables?: Record<string, string>
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
	errorConfig?: ErrorHandlerConfig
}

interface UseSmartInputReturn {
	// Text parsing
	textSegments: TextSegment[]
	hasVariables: boolean
	validVariableCount: number
	invalidVariableCount: number

	// Suggestion state
	showSuggestions: boolean
	suggestions: SuggestionItem[]
	selectedIndex: number
	searchQuery: string
	triggerPosition: number

	// Input state
	cursorPosition: number
	selectionStart: number
	selectionEnd: number
	isFocused: boolean

	// Event handlers
	handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
	handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
	handleFocus: (event: React.FocusEvent<HTMLInputElement>) => void
	handleBlur: (event: React.FocusEvent<HTMLInputElement>) => void
	handleSelectionChange: (start: number, end: number) => void
	handleCopy: (event: React.ClipboardEvent<HTMLInputElement>) => void
	handlePaste: (event: React.ClipboardEvent<HTMLInputElement>) => void
	handleCut: (event: React.ClipboardEvent<HTMLInputElement>) => void

	// Suggestion actions
	handleSuggestionSelect: (suggestion: SuggestionItem) => void
	closeSuggestions: () => void
	insertVariableAtCursor: (variableKey: string) => void

	// Text manipulation utilities
	getCursorPosition: () => number
	setCursorPosition: (position: number, snapToVariables?: boolean) => void
	getSelectedText: () => string
	insertTextAtCursor: (
		text: string,
		options?: { autoCompleteVariables?: boolean; preventVariableCorruption?: boolean }
	) => void
	deleteSelection: (options?: {
		preserveVariables?: boolean
		deleteCompleteVariables?: boolean
	}) => void
	selectAll: () => void
	selectVariable: (variableName: string) => void
	selectTextRange: (
		start: number,
		end: number,
		options?: {
			snapToVariables?: boolean
			expandToCompleteVariables?: boolean
			allowPartialVariableSelection?: boolean
		}
	) => any

	// Advanced text operations
	isInVariable: () => boolean
	getCurrentVariable: () => TextSegment | null
	moveToVariableBoundary: (direction: "start" | "end") => void

	// History operations
	undo: () => void
	redo: () => void
	canUndo: boolean
	canRedo: boolean

	// Programmatic updates
	updateValue: (
		newValue: string,
		options?: {
			preserveCursorPosition?: boolean
			maintainRelativePosition?: boolean
			snapToVariables?: boolean
		}
	) => void
	replaceSelection: (
		text: string,
		options?: { autoCompleteVariables?: boolean; preventVariableCorruption?: boolean }
	) => void

	// Refs for input element
	inputRef: React.RefObject<HTMLInputElement | null>
}

/**
 * Main hook that provides all SmartInput functionality
 */
export const useSmartInput = ({
	value,
	onChange,
	variables = {},
	onFocus,
	onBlur,
	errorConfig = DEFAULT_ERROR_CONFIG,
}: UseSmartInputProps): UseSmartInputReturn => {
	// Helper to create synthetic change events
	const createChangeEvent = useCallback((newValue: string): React.ChangeEvent<HTMLInputElement> => {
		// Create a more complete synthetic event that matches React's ChangeEvent interface
		const target =
			inputRef.current ||
			({
				value: newValue,
				name: "",
				type: "text",
			} as HTMLInputElement)

		return {
			target: { ...target, value: newValue },
			currentTarget: { ...target, value: newValue },
			type: "change",
			bubbles: true,
			cancelable: true,
			timeStamp: Date.now(),
			isTrusted: false,
			preventDefault: () => {},
			stopPropagation: () => {},
			nativeEvent: {} as Event,
		} as React.ChangeEvent<HTMLInputElement>
	}, [])

	// Helper to call onChange with proper event
	const callOnChange = useCallback(
		(newValue: string) => {
			onChange(createChangeEvent(newValue))
		},
		[onChange, createChangeEvent]
	)
	// Input element ref
	const inputRef = useRef<HTMLInputElement>(null)

	// Advanced text history for undo/redo with better state management
	const textHistoryRef = useRef(new AdvancedTextHistory())

	// Internal state
	const [cursorPosition, setCursorPosition] = useState(0)
	const [selectionStart, setSelectionStart] = useState(0)
	const [selectionEnd, setSelectionEnd] = useState(0)
	const [isFocused, setIsFocused] = useState(false)
	const [canUndo, setCanUndo] = useState(false)
	const [canRedo, setCanRedo] = useState(false)

	// Text parsing hook with error handling
	const textParser = useTextParser(value, variables)

	// Cursor position change handler for suggestion trigger
	const handleCursorPositionChange = useCallback((position: number) => {
		setCursorPosition(position)
	}, [])

	// Wrapper for suggestion trigger that converts React event to string
	const handleSuggestionChange = useCallback(
		(newValue: string) => {
			callOnChange(newValue)
		},
		[callOnChange]
	)

	// Suggestion trigger hook with error handling
	const suggestionTrigger = useSuggestionTrigger({
		value,
		onChange: handleSuggestionChange,
		variables,
		cursorPosition,
		onCursorPositionChange: handleCursorPositionChange,
		errorConfig,
	})

	// Update cursor position from input element
	const updateCursorPosition = useCallback(() => {
		if (inputRef.current) {
			const element = inputRef.current
			const start = element.selectionStart || 0
			const end = element.selectionEnd || 0

			setCursorPosition(start)
			setSelectionStart(start)
			setSelectionEnd(end)
		}
	}, [])

	// Handle input changes
	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = event.target.value
			const newCursorPosition = event.target.selectionStart || 0

			suggestionTrigger.handleInputChange(newValue, newCursorPosition)
			updateCursorPosition()
		},
		[suggestionTrigger, updateCursorPosition]
	)

	// Handle key down events
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
			// Let suggestion trigger handle navigation keys first
			const handled = suggestionTrigger.handleKeyDown(event)

			if (!handled) {
				// Update cursor position after other key events
				setTimeout(updateCursorPosition, 0)
			}
		},
		[suggestionTrigger, updateCursorPosition]
	)

	// Handle focus events
	const handleFocus = useCallback(
		(event: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(true)
			updateCursorPosition()
			onFocus?.(event)
		},
		[updateCursorPosition, onFocus]
	)

	// Handle blur events
	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(false)
			suggestionTrigger.closeSuggestions()
			onBlur?.(event)
		},
		[suggestionTrigger, onBlur]
	)

	// Handle selection changes
	const handleSelectionChange = useCallback((start: number, end: number) => {
		setSelectionStart(start)
		setSelectionEnd(end)
		setCursorPosition(start)
	}, [])

	// Utility functions
	const getCursorPosition = useCallback(() => {
		return inputRef.current?.selectionStart || 0
	}, [])

	const setCursorPositionUtil = useCallback(
		(position: number, snapToVariables: boolean = true) => {
			if (inputRef.current) {
				// Use advanced cursor positioning with variable awareness
				const advancedPosition = getAdvancedCursorPosition(
					value,
					position,
					textParser.segments,
					"right",
					snapToVariables,
					errorConfig
				)

				const finalPosition = advancedPosition.position
				inputRef.current.setSelectionRange(finalPosition, finalPosition)
				setCursorPosition(finalPosition)

				if (advancedPosition.adjustmentMade && errorConfig.enableLogging) {
					console.log("Cursor position adjusted for variable boundaries")
				}
			}
		},
		[value, textParser.segments, errorConfig]
	)

	const getSelectedText = useCallback(() => {
		if (selectionStart !== selectionEnd) {
			return value.slice(selectionStart, selectionEnd)
		}
		return ""
	}, [value, selectionStart, selectionEnd])

	const insertTextAtCursor = useCallback(
		(
			text: string,
			options?: { autoCompleteVariables?: boolean; preventVariableCorruption?: boolean }
		) => {
			// Add to history before change
			textHistoryRef.current.addState(
				value,
				cursorPosition,
				selectionStart,
				selectionEnd,
				"insert",
				{ insertedText: text }
			)

			const result = insertTextAdvanced(
				value,
				text,
				cursorPosition,
				textParser.segments,
				{
					replaceSelection: selectionStart !== selectionEnd,
					selectionStart,
					selectionEnd,
					autoCompleteVariables: options?.autoCompleteVariables ?? true,
					preventVariableCorruption: options?.preventVariableCorruption ?? true,
				},
				errorConfig
			)

			if (result.warnings.length > 0 && errorConfig.enableLogging) {
				console.warn("Text insertion warnings:", result.warnings)
			}

			callOnChange(result.newText)
			setTimeout(() => setCursorPositionUtil(result.newCursorPosition), 0)

			// Update history state
			setCanUndo(textHistoryRef.current.canUndo())
			setCanRedo(textHistoryRef.current.canRedo())
		},
		[
			value,
			cursorPosition,
			selectionStart,
			selectionEnd,
			textParser.segments,
			onChange,
			setCursorPositionUtil,
			errorConfig,
		]
	)

	// Enhanced text manipulation utilities
	const deleteSelection = useCallback(
		(options?: { preserveVariables?: boolean; deleteCompleteVariables?: boolean }) => {
			if (selectionStart !== selectionEnd) {
				// Add to history before change
				const deletedText = value.slice(selectionStart, selectionEnd)
				textHistoryRef.current.addState(
					value,
					cursorPosition,
					selectionStart,
					selectionEnd,
					"delete",
					{ deletedText }
				)

				const result = deleteTextAdvanced(
					value,
					selectionStart,
					selectionEnd,
					textParser.segments,
					{
						preserveVariables: options?.preserveVariables ?? true,
						deleteCompleteVariables: options?.deleteCompleteVariables ?? true,
					},
					errorConfig
				)

				if (result.warnings.length > 0 && errorConfig.enableLogging) {
					console.warn("Text deletion warnings:", result.warnings)
				}

				if (result.deletedVariables.length > 0 && errorConfig.enableLogging) {
					console.log(
						"Deleted variables:",
						result.deletedVariables.map((v) => v.variableName)
					)
				}

				callOnChange(result.newText)
				setTimeout(() => setCursorPositionUtil(result.newCursorPosition), 0)

				// Update history state
				setCanUndo(textHistoryRef.current.canUndo())
				setCanRedo(textHistoryRef.current.canRedo())
			}
		},
		[
			value,
			textParser.segments,
			selectionStart,
			selectionEnd,
			cursorPosition,
			onChange,
			setCursorPositionUtil,
			errorConfig,
		]
	)

	const selectAll = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.select()
			setSelectionStart(0)
			setSelectionEnd(value.length)
		}
	}, [value.length])

	// Enhanced text selection with variable awareness
	const selectTextRange = useCallback(
		(
			start: number,
			end: number,
			options?: {
				snapToVariables?: boolean
				expandToCompleteVariables?: boolean
				allowPartialVariableSelection?: boolean
			}
		) => {
			const result = handleAdvancedTextSelection(
				value,
				start,
				end,
				textParser.segments,
				options,
				errorConfig
			)

			if (result.warnings.length > 0 && errorConfig.enableLogging) {
				console.warn("Text selection warnings:", result.warnings)
			}

			if (inputRef.current) {
				inputRef.current.setSelectionRange(result.adjustedStart, result.adjustedEnd)
				setSelectionStart(result.adjustedStart)
				setSelectionEnd(result.adjustedEnd)
				setCursorPosition(result.adjustedStart)
			}

			return result
		},
		[value, textParser.segments, errorConfig]
	)

	const selectVariable = useCallback(
		(variableName: string) => {
			const segment = textParser.segments.find(
				(seg) =>
					seg.variableName === variableName &&
					(seg.type === "variable" || seg.type === "invalid-variable")
			)

			if (segment && inputRef.current) {
				inputRef.current.setSelectionRange(segment.startIndex, segment.endIndex)
				setSelectionStart(segment.startIndex)
				setSelectionEnd(segment.endIndex)
				setCursorPosition(segment.startIndex)
			}
		},
		[textParser.segments]
	)

	// Advanced text operations
	const isInVariable = useCallback(() => {
		return isCursorInVariable(textParser.segments, cursorPosition).isInVariable
	}, [textParser.segments, cursorPosition])

	const getCurrentVariable = useCallback(() => {
		const result = isCursorInVariable(textParser.segments, cursorPosition)
		return result.segment || null
	}, [textParser.segments, cursorPosition])

	const moveToVariableBoundary = useCallback(
		(direction: "start" | "end") => {
			const currentVar = getCurrentVariable()
			if (currentVar) {
				const newPosition = direction === "start" ? currentVar.startIndex : currentVar.endIndex
				setCursorPositionUtil(newPosition)
			}
		},
		[getCurrentVariable, setCursorPositionUtil]
	)

	// History operations
	const undo = useCallback(() => {
		const previousState = textHistoryRef.current.undo()
		if (previousState) {
			callOnChange(previousState.text)
			setTimeout(() => setCursorPositionUtil(previousState.cursorPosition), 0)

			setCanUndo(textHistoryRef.current.canUndo())
			setCanRedo(textHistoryRef.current.canRedo())
		}
	}, [callOnChange, setCursorPositionUtil])

	const redo = useCallback(() => {
		const nextState = textHistoryRef.current.redo()
		if (nextState) {
			callOnChange(nextState.text)
			setTimeout(() => setCursorPositionUtil(nextState.cursorPosition), 0)

			setCanUndo(textHistoryRef.current.canUndo())
			setCanRedo(textHistoryRef.current.canRedo())
		}
	}, [callOnChange, setCursorPositionUtil])

	// Enhanced programmatic updates with intelligent cursor positioning
	const updateValue = useCallback(
		(
			newValue: string,
			options?: {
				preserveCursorPosition?: boolean
				maintainRelativePosition?: boolean
				snapToVariables?: boolean
			}
		) => {
			const result = updateValueProgrammaticallyAdvanced(
				value,
				newValue,
				cursorPosition,
				selectionStart,
				selectionEnd,
				textParser.segments,
				options,
				errorConfig
			)

			if (result.textChanged) {
				// Add to history before change
				textHistoryRef.current.addState(
					value,
					cursorPosition,
					selectionStart,
					selectionEnd,
					"programmatic",
					{
						variablesAffected: [
							...result.variableChanges.added,
							...result.variableChanges.removed,
							...result.variableChanges.modified,
						],
					}
				)

				if (errorConfig.enableLogging) {
					if (result.variableChanges.added.length > 0) {
						console.log("Variables added:", result.variableChanges.added)
					}
					if (result.variableChanges.removed.length > 0) {
						console.log("Variables removed:", result.variableChanges.removed)
					}
					if (result.cursorAdjusted) {
						console.log("Cursor position adjusted during programmatic update")
					}
				}

				callOnChange(newValue)
				setTimeout(() => {
					setCursorPositionUtil(result.newCursorPosition, false) // Don't snap again
					if (result.newSelectionStart !== result.newSelectionEnd) {
						setSelectionStart(result.newSelectionStart)
						setSelectionEnd(result.newSelectionEnd)
					}
				}, 0)

				// Update history state
				setCanUndo(textHistoryRef.current.canUndo())
				setCanRedo(textHistoryRef.current.canRedo())
			}
		},
		[
			value,
			cursorPosition,
			selectionStart,
			selectionEnd,
			textParser.segments,
			onChange,
			setCursorPositionUtil,
			errorConfig,
		]
	)

	const replaceSelection = useCallback(
		(
			text: string,
			options?: { autoCompleteVariables?: boolean; preventVariableCorruption?: boolean }
		) => {
			// Add to history before change
			const replacedText = value.slice(selectionStart, selectionEnd)
			textHistoryRef.current.addState(
				value,
				cursorPosition,
				selectionStart,
				selectionEnd,
				"replace",
				{ deletedText: replacedText, insertedText: text }
			)

			const result = insertTextAdvanced(
				value,
				text,
				cursorPosition,
				textParser.segments,
				{
					replaceSelection: true,
					selectionStart,
					selectionEnd,
					autoCompleteVariables: options?.autoCompleteVariables ?? true,
					preventVariableCorruption: options?.preventVariableCorruption ?? true,
				},
				errorConfig
			)

			if (result.warnings.length > 0 && errorConfig.enableLogging) {
				console.warn("Text replacement warnings:", result.warnings)
			}

			callOnChange(result.newText)
			setTimeout(() => setCursorPositionUtil(result.newCursorPosition), 0)

			// Update history state
			setCanUndo(textHistoryRef.current.canUndo())
			setCanRedo(textHistoryRef.current.canRedo())
		},
		[
			value,
			selectionStart,
			selectionEnd,
			cursorPosition,
			textParser.segments,
			onChange,
			setCursorPositionUtil,
			errorConfig,
		]
	)

	// Clipboard operations
	const handleCopy = useCallback(
		(event: React.ClipboardEvent<HTMLInputElement>) => {
			const result = copyTextWithVariables(value, selectionStart, selectionEnd, textParser.segments)

			// Let the browser handle the actual copy operation
			// The result can be used for analytics or notifications
		},
		[value, selectionStart, selectionEnd, textParser.segments]
	)

	const handlePaste = useCallback(
		(event: React.ClipboardEvent<HTMLInputElement>) => {
			event.preventDefault()

			const pastedText = event.clipboardData.getData("text")
			const result = pasteTextWithVariableRecognition(value, pastedText, cursorPosition, variables)

			// Add to history before change
			textHistoryRef.current.addState(value, cursorPosition)

			callOnChange(result.newText)
			setTimeout(() => setCursorPositionUtil(result.newCursorPosition), 0)

			// Update history state
			setCanUndo(textHistoryRef.current.canUndo())
			setCanRedo(textHistoryRef.current.canRedo())
		},
		[value, cursorPosition, variables, callOnChange, setCursorPositionUtil]
	)

	const handleCut = useCallback(
		(event: React.ClipboardEvent<HTMLInputElement>) => {
			// Let browser handle copy to clipboard
			const result = handlePartialVariableDeletion(
				value,
				textParser.segments,
				selectionStart,
				selectionEnd
			)

			// Add to history before change
			textHistoryRef.current.addState(value, cursorPosition)

			callOnChange(result.newText)
			setTimeout(() => setCursorPositionUtil(result.newCursorPosition), 0)

			// Update history state
			setCanUndo(textHistoryRef.current.canUndo())
			setCanRedo(textHistoryRef.current.canRedo())
		},
		[
			value,
			textParser.segments,
			selectionStart,
			selectionEnd,
			cursorPosition,
			onChange,
			setCursorPositionUtil,
		]
	)

	// Initialize text history with initial value
	useEffect(() => {
		textHistoryRef.current.addState(value, 0, 0, 0, "programmatic")
		setCanUndo(textHistoryRef.current.canUndo())
		setCanRedo(textHistoryRef.current.canRedo())
	}, []) // Only run on mount

	// Update cursor position when clicking in input
	useEffect(() => {
		const handleClick = () => updateCursorPosition()
		const handleKeyUp = () => updateCursorPosition()

		const element = inputRef.current
		if (element) {
			element.addEventListener("click", handleClick)
			element.addEventListener("keyup", handleKeyUp)
			element.addEventListener("select", handleClick)

			return () => {
				element.removeEventListener("click", handleClick)
				element.removeEventListener("keyup", handleKeyUp)
				element.removeEventListener("select", handleClick)
			}
		}
	}, [updateCursorPosition])

	return {
		// Text parsing
		textSegments: textParser.segments,
		hasVariables: textParser.hasVariables,
		validVariableCount: textParser.validVariableCount,
		invalidVariableCount: textParser.invalidVariableCount,

		// Suggestion state
		showSuggestions: suggestionTrigger.showSuggestions,
		suggestions: suggestionTrigger.suggestions,
		selectedIndex: suggestionTrigger.selectedIndex,
		searchQuery: suggestionTrigger.searchQuery,
		triggerPosition: suggestionTrigger.triggerPosition,

		// Input state
		cursorPosition,
		selectionStart,
		selectionEnd,
		isFocused,

		// Event handlers
		handleInputChange,
		handleKeyDown,
		handleFocus,
		handleBlur,
		handleSelectionChange,
		handleCopy,
		handlePaste,
		handleCut,

		// Suggestion actions
		handleSuggestionSelect: suggestionTrigger.handleSuggestionSelect,
		closeSuggestions: suggestionTrigger.closeSuggestions,
		insertVariableAtCursor: suggestionTrigger.insertVariableAtCursor,

		// Text manipulation utilities
		getCursorPosition,
		setCursorPosition: setCursorPositionUtil,
		getSelectedText,
		insertTextAtCursor,
		deleteSelection,
		selectAll,
		selectVariable,
		selectTextRange,

		// Advanced text operations
		isInVariable,
		getCurrentVariable,
		moveToVariableBoundary,

		// History operations
		undo,
		redo,
		canUndo,
		canRedo,

		// Programmatic updates
		updateValue,
		replaceSelection,

		// Refs
		inputRef,
	}
}
