/**
 * Hook for managing suggestion trigger detection and filtering
 * Handles cursor position tracking, pattern detection, and suggestion state
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { SuggestionItem, SuggestionTrigger } from "@/types/smart-input"
import {
	detectSuggestionTrigger,
	filterSuggestions,
	insertVariable,
	debounce,
} from "@/lib/smart-input-utils"
import {
	DEFAULT_ERROR_CONFIG,
	ErrorHandlerConfig,
	validateCursorPosition,
} from "@/lib/smart-input-error-handling"
import { DEBOUNCE_DELAY, MAX_SUGGESTIONS, KEYBOARD_KEYS } from "@/lib/smart-input-constants"

interface UseSuggestionTriggerProps {
	value: string
	onChange: (value: string) => void
	variables: Record<string, string>
	cursorPosition: number
	onCursorPositionChange: (position: number) => void
	errorConfig?: ErrorHandlerConfig
}

interface UseSuggestionTriggerReturn {
	// Suggestion state
	showSuggestions: boolean
	suggestions: SuggestionItem[]
	selectedIndex: number
	searchQuery: string
	triggerPosition: number

	// Event handlers
	handleInputChange: (newValue: string, newCursorPosition: number) => void
	handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => boolean
	handleSuggestionSelect: (suggestion: SuggestionItem) => void
	handleSuggestionHover: (index: number) => void
	closeSuggestions: () => void

	// Navigation utilities
	navigateToSuggestion: (index: number) => void
	navigateToFirst: () => void
	navigateToLast: () => void
	getSelectedSuggestion: () => SuggestionItem | null
	insertVariableAtCursor: (variableKey: string) => void
}

export const useSuggestionTrigger = ({
	value,
	onChange,
	variables,
	cursorPosition,
	onCursorPositionChange,
	errorConfig = DEFAULT_ERROR_CONFIG,
}: UseSuggestionTriggerProps): UseSuggestionTriggerReturn => {
	// Suggestion state
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [searchQuery, setSearchQuery] = useState("")
	const [triggerPosition, setTriggerPosition] = useState(-1)

	// Refs for debouncing
	const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Debounced suggestion filtering with error handling
	const debouncedFilterSuggestions = useCallback(
		debounce((query: string) => {
			try {
				const filtered = filterSuggestions(variables, query)
				const limitedSuggestions = filtered.slice(0, MAX_SUGGESTIONS)
				setSuggestions(limitedSuggestions)
				setSelectedIndex(0) // Reset selection when suggestions change
			} catch (error) {
				if (errorConfig.enableLogging) {
					console.error("Suggestion filtering failed:", error)
				}
				setSuggestions([])
				setSelectedIndex(0)
			}
		}, DEBOUNCE_DELAY),
		[variables, errorConfig]
	)

	// Handle input changes with cursor position validation
	const handleInputChange = useCallback(
		(newValue: string, newCursorPosition: number) => {
			try {
				// Validate cursor position
				const { position: validatedPosition, error } = validateCursorPosition(
					newCursorPosition,
					newValue.length,
					errorConfig
				)

				if (error && errorConfig.enableLogging) {
					console.warn("Cursor position validation warning:", error)
				}

				onChange(newValue)
				onCursorPositionChange(validatedPosition)
			} catch (error) {
				if (errorConfig.enableLogging) {
					console.error("Input change handling failed:", error)
				}
				// Fallback to basic handling
				onChange(newValue)
				onCursorPositionChange(Math.max(0, Math.min(newCursorPosition, newValue.length)))
			}
		},
		[onChange, onCursorPositionChange, errorConfig]
	)

	// Close suggestions
	const closeSuggestions = useCallback(() => {
		setShowSuggestions(false)
		setSearchQuery("")
		setTriggerPosition(-1)
		setSuggestions([])
		setSelectedIndex(0)
	}, [])

	// Handle suggestion selection with enhanced insertion
	const handleSuggestionSelect = useCallback(
		(suggestion: SuggestionItem) => {
			const result = insertVariable(value, suggestion.key, triggerPosition, searchQuery)

			if (result) {
				handleInputChange(result.newText, result.newCursorPosition)
				closeSuggestions()
			}
		},
		[value, triggerPosition, searchQuery, handleInputChange, closeSuggestions]
	)

	// Navigate to specific suggestion by index
	const navigateToSuggestion = useCallback(
		(index: number) => {
			if (index >= 0 && index < suggestions.length) {
				setSelectedIndex(index)
			}
		},
		[suggestions.length]
	)

	// Navigate to first suggestion
	const navigateToFirst = useCallback(() => {
		if (suggestions.length > 0) {
			setSelectedIndex(0)
		}
	}, [suggestions.length])

	// Navigate to last suggestion
	const navigateToLast = useCallback(() => {
		if (suggestions.length > 0) {
			setSelectedIndex(suggestions.length - 1)
		}
	}, [suggestions.length])

	// Handle mouse hover for suggestion selection
	const handleSuggestionHover = useCallback((index: number) => {
		setSelectedIndex(index)
	}, [])

	// Get currently selected suggestion
	const getSelectedSuggestion = useCallback(() => {
		return suggestions[selectedIndex] || null
	}, [suggestions, selectedIndex])

	// Insert variable at current cursor position
	const insertVariableAtCursor = useCallback(
		(variableKey: string) => {
			if (triggerPosition >= 0) {
				const result = insertVariable(value, variableKey, triggerPosition, searchQuery)
				handleInputChange(result.newText, result.newCursorPosition)
				closeSuggestions()
			}
		},
		[value, triggerPosition, searchQuery, handleInputChange, closeSuggestions]
	)

	// Handle keyboard navigation and selection
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>): boolean => {
			if (!showSuggestions || suggestions.length === 0) {
				return false // Let the input handle the key
			}

			switch (event.key) {
				case KEYBOARD_KEYS.ARROW_DOWN:
					event.preventDefault()
					setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
					return true

				case KEYBOARD_KEYS.ARROW_UP:
					event.preventDefault()
					setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
					return true

				case KEYBOARD_KEYS.ENTER:
					event.preventDefault()
					if (suggestions[selectedIndex]) {
						handleSuggestionSelect(suggestions[selectedIndex])
					}
					return true

				case KEYBOARD_KEYS.ESCAPE:
					event.preventDefault()
					closeSuggestions()
					return true

				case KEYBOARD_KEYS.TAB:
					// Allow Tab to select current suggestion or close if none selected
					if (suggestions[selectedIndex]) {
						event.preventDefault()
						handleSuggestionSelect(suggestions[selectedIndex])
						return true
					} else {
						closeSuggestions()
						return false // Let Tab continue to next field
					}

				default:
					return false // Let the input handle other keys
			}
		},
		[showSuggestions, suggestions, selectedIndex, handleSuggestionSelect, closeSuggestions]
	)

	// Update suggestions when trigger state changes
	useEffect(() => {
		const trigger = detectSuggestionTrigger(value, cursorPosition)

		if (trigger.shouldShow) {
			setShowSuggestions(true)
			setSearchQuery(trigger.searchQuery)
			setTriggerPosition(trigger.triggerPosition)

			// Filter suggestions based on search query
			debouncedFilterSuggestions(trigger.searchQuery)
		} else {
			setShowSuggestions(false)
			setSearchQuery("")
			setTriggerPosition(-1)
			setSuggestions([])
			setSelectedIndex(0)
		}
	}, [value, cursorPosition, debouncedFilterSuggestions])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (filterTimeoutRef.current) {
				clearTimeout(filterTimeoutRef.current)
			}
		}
	}, [])

	return {
		// Suggestion state
		showSuggestions,
		suggestions,
		selectedIndex,
		searchQuery,
		triggerPosition,

		// Event handlers
		handleInputChange,
		handleKeyDown,
		handleSuggestionSelect,
		handleSuggestionHover,
		closeSuggestions,

		// Navigation utilities
		navigateToSuggestion,
		navigateToFirst,
		navigateToLast,
		getSelectedSuggestion,
		insertVariableAtCursor,
	}
}
