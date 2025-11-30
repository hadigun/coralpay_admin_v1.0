/**
 * Constants and default configurations for Smart Input component
 * Focus: Visual styling and autocomplete UX, not template processing
 */

import { VariableStyle } from "@/types/smart-input"

/**
 * Default styling for valid environment variable references
 * Minimal styling with only color and italics for clean appearance
 */
export const DEFAULT_VARIABLE_STYLE: VariableStyle = {
	backgroundColor: "transparent", // No background
	fontWeight: "normal", // Same as regular text
	fontStyle: "italic", // Italic for distinction
	textColor: "rgb(37 99 235)", // Blue color for visibility
	borderRadius: "0", // No border radius
}

/**
 * Default styling for invalid environment variable references
 * Minimal styling with only color and italics for clean appearance
 */
export const DEFAULT_INVALID_VARIABLE_STYLE: VariableStyle = {
	backgroundColor: "transparent", // No background
	fontWeight: "normal", // Same as regular text
	fontStyle: "italic", // Italic for distinction
	textColor: "rgb(220 38 38)", // Red color for errors
	borderRadius: "0", // No border radius
}

/**
 * Debounce delay for text parsing and suggestion filtering (in milliseconds)
 */
export const DEBOUNCE_DELAY = 150

/**
 * Maximum number of suggestions to display
 */
export const MAX_SUGGESTIONS = 10

/**
 * Keyboard navigation keys
 */
export const KEYBOARD_KEYS = {
	ARROW_UP: "ArrowUp",
	ARROW_DOWN: "ArrowDown",
	ENTER: "Enter",
	ESCAPE: "Escape",
	TAB: "Tab",
} as const

/**
 * ARIA attributes for accessibility
 */
export const ARIA_ATTRIBUTES = {
	COMBOBOX_ROLE: "combobox",
	LISTBOX_ROLE: "listbox",
	OPTION_ROLE: "option",
	EXPANDED: "aria-expanded",
	ACTIVE_DESCENDANT: "aria-activedescendant",
	AUTOCOMPLETE: "aria-autocomplete",
	DESCRIBEDBY: "aria-describedby",
	LABEL: "aria-label",
	LABELLEDBY: "aria-labelledby",
} as const

/**
 * CSS class names for styling
 */
export const CSS_CLASSES = {
	VARIABLE_SEGMENT: "smart-input-variable",
	INVALID_VARIABLE_SEGMENT: "smart-input-invalid-variable",
	TEXT_SEGMENT: "smart-input-text",
	SUGGESTION_ITEM: "smart-input-suggestion",
	SUGGESTION_SELECTED: "smart-input-suggestion-selected",
	INPUT_OVERLAY: "smart-input-overlay",
	INPUT_BASE: "smart-input-base",
} as const

/**
 * Regular expressions for pattern matching
 */
export const REGEX_PATTERNS = {
	VARIABLE_PATTERN: /\{\{([^}]+)\}\}/g,
	VARIABLE_SINGLE: /^\{\{([^{}]+)\}\}$/,
	TRIGGER_PATTERN: /\{\{([^}]*)$/,
	VALID_VARIABLE_NAME: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
	INCOMPLETE_VARIABLE: /\{\{(?![^}]*\}\})/g,
	MALFORMED_CLOSING: /\}\}(?!\{\{)/g,
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
	NO_VARIABLES: "No variables available",
	NO_MATCHES: "No matching variables",
	INVALID_SYNTAX: "Invalid variable syntax",
	VARIABLE_NOT_FOUND: "Variable not found",
} as const
/**
 * Fuse.js configuration for fuzzy search
 */
export const FUSE_CONFIG = {
	// Search sensitivity (0.0 = exact match, 1.0 = match anything)
	THRESHOLD: 0.6,

	// Minimum character length to trigger search
	MIN_MATCH_CHAR_LENGTH: 1,

	// Key weights for multi-field search
	KEY_WEIGHTS: {
		VARIABLE_KEY: 0.8,
		VARIABLE_VALUE: 0.2,
	},

	// Performance settings
	IGNORE_LOCATION: true,
	FIND_ALL_MATCHES: true,
	SHOULD_SORT: true,
	INCLUDE_SCORE: true,
} as const

/**
 * Ranking boost multipliers for different match types
 */
export const RANKING_MULTIPLIERS = {
	EXACT_MATCH: 0.0,
	PREFIX_MATCH: 0.1,
	SUBSTRING_MATCH: 0.3,
	FUZZY_MATCH_OFFSET: 0.5,
} as const
