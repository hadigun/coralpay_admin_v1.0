/**
 * Core TypeScript interfaces for Smart Input component
 */

import { ReactNode } from "react"

/**
 * Text segment representing different parts of the input text
 */
export interface TextSegment {
	id: string
	type: "text" | "variable" | "invalid-variable"
	content: string
	startIndex: number
	endIndex: number
	variableName?: string // For variable segments
	isValid?: boolean // For variable validation
}

/**
 * Suggestion item for environment variable autocomplete
 */
export interface SuggestionItem {
	key: string
	value: string
	score?: number // For fuzzy search ranking
}

/**
 * Styling configuration for environment variable references
 */
export interface VariableStyle {
	backgroundColor?: string
	fontWeight?: "normal" | "bold"
	fontStyle?: "normal" | "italic"
	textColor?: string
	borderRadius?: string
}

/**
 * Main SmartInput component props
 */
export interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	value: string
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
	variables?: Record<string, string>

	// Styling options for environment variable references
	variableStyle?: VariableStyle

	// Error styling for invalid variables
	invalidVariableStyle?: VariableStyle
}

/**
 * Internal state management for SmartInput
 */
export interface SmartInputState {
	// Text content and cursor position
	value: string
	cursorPosition: number
	selectionStart: number
	selectionEnd: number

	// Suggestion state
	showSuggestions: boolean
	suggestionTriggerPosition: number
	filteredSuggestions: SuggestionItem[]
	selectedSuggestionIndex: number
	searchQuery: string

	// Parsing state
	textSegments: TextSegment[]

	// Focus state
	isFocused: boolean
}

/**
 * Suggestion trigger detection result
 */
export interface SuggestionTrigger {
	shouldShow: boolean
	triggerPosition: number
	searchQuery: string
}

/**
 * Props for EnvironmentSuggestions component
 */
export interface EnvironmentSuggestionsProps {
	isOpen: boolean
	suggestions: SuggestionItem[]
	selectedIndex: number
	onSelect: (suggestion: SuggestionItem) => void
	onClose: () => void
	children: ReactNode // The input/textarea trigger
}

/**
 * Extended props for EnvironmentSuggestions with accessibility and customization options
 */
export interface EnvironmentSuggestionsExtendedProps extends EnvironmentSuggestionsProps {
	onHover?: (index: number) => void
	emptyMessage?: string
	noVariablesMessage?: string
	inputId?: string // For aria-describedby relationship
}

/**
 * Props for SmartInputRenderer component
 */
export interface SmartInputRendererProps {
	segments: TextSegment[]
	variableStyle?: VariableStyle
	invalidVariableStyle?: VariableStyle
	className?: string
	inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
}

/**
 * Props for SmartInputBase wrapper component
 */
export interface SmartInputBaseProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	value: string
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
	onCursorPositionChange?: (position: number) => void
	onSelectionChange?: (start: number, end: number) => void
	className?: string
}
