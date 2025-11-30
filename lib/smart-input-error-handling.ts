/**
 * Error handling utilities for Smart Input component
 * Provides robust error handling, validation, and graceful degradation
 */

import { TextSegment, SuggestionItem } from "@/types/smart-input"
import { isValidVariableName, generateId } from "./smart-input-validation"
import Fuse, { FuseResult } from "fuse.js"

/**
 * Error types for Smart Input operations
 */
export enum SmartInputErrorType {
	MALFORMED_VARIABLE = "MALFORMED_VARIABLE",
	NESTED_BRACES = "NESTED_BRACES",
	INVALID_VARIABLE_NAME = "INVALID_VARIABLE_NAME",
	UNDEFINED_VARIABLES = "UNDEFINED_VARIABLES",
	PARSING_ERROR = "PARSING_ERROR",
	SUGGESTION_ERROR = "SUGGESTION_ERROR",
	CURSOR_POSITION_ERROR = "CURSOR_POSITION_ERROR",
	TEXT_MANIPULATION_ERROR = "TEXT_MANIPULATION_ERROR",
}

/**
 * Error information interface
 */
export interface SmartInputError {
	type: SmartInputErrorType
	message: string
	position?: number
	segment?: TextSegment
	originalError?: Error
	recoverable: boolean
	suggestions?: string[]
}

/**
 * Validation result interface
 */
export interface ValidationResult {
	isValid: boolean
	errors: SmartInputError[]
	warnings: SmartInputError[]
	segments: TextSegment[]
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
	enableLogging: boolean
	enableRecovery: boolean
	maxRecoveryAttempts: number
	fallbackValue: string
}

/**
 * Default error handler configuration
 */
export const DEFAULT_ERROR_CONFIG: ErrorHandlerConfig = {
	enableLogging: true,
	enableRecovery: true,
	maxRecoveryAttempts: 3,
	fallbackValue: "",
}

/**
 * Validate variable syntax and detect malformed patterns
 */
export const validateVariableSyntax = (text: string): SmartInputError[] => {
	const errors: SmartInputError[] = []

	// Check for nested braces
	const nestedBracesPattern = /\{\{[^}]*\{[^}]*\}\}/g
	let match

	while ((match = nestedBracesPattern.exec(text)) !== null) {
		errors.push({
			type: SmartInputErrorType.NESTED_BRACES,
			message: "Nested braces are not allowed in variable references",
			position: match.index,
			recoverable: true,
			suggestions: ["Remove nested braces", "Use separate variables"],
		})
	}

	// Check for malformed variable patterns
	const malformedPatterns = [
		{ pattern: /\{\{[^}]*$/g, message: "Unclosed variable reference" },
		{ pattern: /\{[^{][^}]*\}/g, message: "Single brace variable (should use double braces)" },
		{ pattern: /\{\{\s*\}\}/g, message: "Empty variable reference" },
		{ pattern: /\{\{[^}]*\s\s+[^}]*\}\}/g, message: "Multiple spaces in variable name" },
	]

	malformedPatterns.forEach(({ pattern, message }) => {
		pattern.lastIndex = 0 // Reset regex state
		while ((match = pattern.exec(text)) !== null) {
			errors.push({
				type: SmartInputErrorType.MALFORMED_VARIABLE,
				message,
				position: match.index,
				recoverable: true,
				suggestions: ["Fix variable syntax", "Use {{variableName}} format"],
			})
		}
	})

	// Check for special characters in variable names
	const variablePattern = /\{\{([^}]+)\}\}/g
	while ((match = variablePattern.exec(text)) !== null) {
		const variableName = match[1].trim()

		if (!isValidVariableName(variableName)) {
			errors.push({
				type: SmartInputErrorType.INVALID_VARIABLE_NAME,
				message: `Invalid variable name: "${variableName}". Variable names must start with a letter or underscore, followed by letters, numbers, or underscores.`,
				position: match.index,
				recoverable: true,
				suggestions: [
					"Use only letters, numbers, and underscores",
					"Start with a letter or underscore",
					"Remove special characters",
				],
			})
		}
	}

	return errors
}

/**
 * Enhanced text parsing with comprehensive error detection
 */
export const parseTextWithErrorHandling = (
	text: string,
	availableVariables: Record<string, string> = {},
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): ValidationResult => {
	const errors: SmartInputError[] = []
	const warnings: SmartInputError[] = []
	let segments: TextSegment[] = []

	try {
		// First, validate syntax
		const syntaxErrors = validateVariableSyntax(text)
		errors.push(...syntaxErrors)

		// Attempt to parse text even with errors for graceful degradation
		segments = parseTextSafely(text, availableVariables, config)

		// Check for undefined variables
		segments.forEach((segment) => {
			if (segment.type === "invalid-variable" && segment.variableName) {
				if (isValidVariableName(segment.variableName)) {
					warnings.push({
						type: SmartInputErrorType.UNDEFINED_VARIABLES,
						message: `Variable "${segment.variableName}" is not defined in available variables`,
						position: segment.startIndex,
						segment,
						recoverable: true,
						suggestions: [
							"Check variable name spelling",
							"Add variable to environment",
							"Use a different variable",
						],
					})
				}
			}
		})
	} catch (error) {
		errors.push({
			type: SmartInputErrorType.PARSING_ERROR,
			message: `Failed to parse text: ${error instanceof Error ? error.message : "Unknown error"}`,
			originalError: error instanceof Error ? error : undefined,
			recoverable: false,
		})

		// Fallback to basic text segment
		segments = [
			{
				id: "fallback-text",
				type: "text",
				content: text,
				startIndex: 0,
				endIndex: text.length,
			},
		]
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		segments,
	}
}

/**
 * Basic text parsing function (internal to avoid circular dependencies)
 */
const parseTextInternal = (
	text: string,
	availableVariables: Record<string, string> = {}
): TextSegment[] => {
	const segments: TextSegment[] = []
	const variablePattern = /\{\{([^}]+)\}\}/g
	let lastIndex = 0
	let match

	while ((match = variablePattern.exec(text)) !== null) {
		// Add text segment before variable
		if (match.index > lastIndex) {
			segments.push({
				id: generateId(),
				type: "text",
				content: text.slice(lastIndex, match.index),
				startIndex: lastIndex,
				endIndex: match.index,
			})
		}

		// Add variable segment
		const variableName = match[1].trim()
		const isValid =
			isValidVariableName(variableName) && availableVariables.hasOwnProperty(variableName)

		segments.push({
			id: generateId(),
			type: isValid ? "variable" : "invalid-variable",
			content: match[0],
			startIndex: match.index,
			endIndex: match.index + match[0].length,
			variableName,
			isValid,
		})

		lastIndex = match.index + match[0].length
	}

	// Add remaining text
	if (lastIndex < text.length) {
		segments.push({
			id: generateId(),
			type: "text",
			content: text.slice(lastIndex),
			startIndex: lastIndex,
			endIndex: text.length,
		})
	}

	return segments
}

/**
 * Safe text parsing that handles errors gracefully
 */
export const parseTextSafely = (
	text: string,
	availableVariables: Record<string, string> = {},
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): TextSegment[] => {
	try {
		return parseTextInternal(text, availableVariables)
	} catch (error) {
		if (config.enableLogging) {
			console.warn("Smart Input: Failed to parse text, using fallback", error)
		}

		// Return fallback text segment
		return [
			{
				id: generateId(),
				type: "text",
				content: text,
				startIndex: 0,
				endIndex: text.length,
			},
		]
	}
}

/**
 * Graceful degradation when variables prop is undefined
 */
export const handleUndefinedVariables = (
	variables: Record<string, string> | undefined,
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): Record<string, string> => {
	if (variables === undefined || variables === null) {
		if (config.enableLogging) {
			console.warn("Smart Input: Variables prop is undefined, using empty object")
		}
		return {}
	}

	// Validate variables object
	if (typeof variables !== "object") {
		if (config.enableLogging) {
			console.warn("Smart Input: Variables prop is not an object, using empty object")
		}
		return {}
	}

	// Filter out invalid variable entries
	const validVariables: Record<string, string> = {}

	Object.entries(variables).forEach(([key, value]) => {
		if (typeof key === "string" && typeof value === "string") {
			if (isValidVariableName(key)) {
				validVariables[key] = value
			} else if (config.enableLogging) {
				console.warn(`Smart Input: Invalid variable name "${key}", skipping`)
			}
		} else if (config.enableLogging) {
			console.warn(`Smart Input: Invalid variable entry [${key}: ${value}], skipping`)
		}
	})

	return validVariables
}

/**
 * Safe suggestion filtering with error handling
 */
export const filterSuggestionsSafely = (
	variables: Record<string, string>,
	searchQuery: string,
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): { suggestions: SuggestionItem[]; error?: SmartInputError } => {
	try {
		// Validate inputs
		if (!variables || typeof variables !== "object") {
			return {
				suggestions: [],
				error: {
					type: SmartInputErrorType.SUGGESTION_ERROR,
					message: "Invalid variables object provided",
					recoverable: true,
				},
			}
		}

		if (typeof searchQuery !== "string") {
			return {
				suggestions: [],
				error: {
					type: SmartInputErrorType.SUGGESTION_ERROR,
					message: "Invalid search query provided",
					recoverable: true,
				},
			}
		}

		// Internal filtering implementation with error handling
		const suggestions = filterSuggestionsInternal(variables, searchQuery)

		return { suggestions }
	} catch (error) {
		const errorInfo: SmartInputError = {
			type: SmartInputErrorType.SUGGESTION_ERROR,
			message: `Failed to filter suggestions: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
			originalError: error instanceof Error ? error : undefined,
			recoverable: true,
		}

		if (config.enableLogging) {
			console.error("Smart Input: Suggestion filtering failed", error)
		}

		return {
			suggestions: [],
			error: errorInfo,
		}
	}
}

/**
 * Safe cursor position validation and correction
 */
export const validateCursorPosition = (
	position: number,
	textLength: number,
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): { position: number; error?: SmartInputError } => {
	try {
		// Validate position is a number
		if (typeof position !== "number" || isNaN(position)) {
			return {
				position: 0,
				error: {
					type: SmartInputErrorType.CURSOR_POSITION_ERROR,
					message: "Invalid cursor position: not a number",
					recoverable: true,
				},
			}
		}

		// Clamp position to valid range
		const clampedPosition = Math.max(0, Math.min(position, textLength))

		if (clampedPosition !== position) {
			const error: SmartInputError = {
				type: SmartInputErrorType.CURSOR_POSITION_ERROR,
				message: `Cursor position ${position} out of bounds, clamped to ${clampedPosition}`,
				recoverable: true,
			}

			if (config.enableLogging) {
				console.warn("Smart Input: Cursor position corrected", error.message)
			}

			return { position: clampedPosition, error }
		}

		return { position }
	} catch (error) {
		return {
			position: 0,
			error: {
				type: SmartInputErrorType.CURSOR_POSITION_ERROR,
				message: `Failed to validate cursor position: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
				originalError: error instanceof Error ? error : undefined,
				recoverable: true,
			},
		}
	}
}

/**
 * Safe text manipulation with error recovery
 */
export const safeTextManipulation = <T extends (...args: any[]) => any>(
	operation: T,
	fallbackResult: ReturnType<T>,
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
) => {
	return (...args: Parameters<T>): ReturnType<T> => {
		try {
			return operation(...args)
		} catch (error) {
			if (config.enableLogging) {
				console.error("Smart Input: Text manipulation failed", error)
			}

			return fallbackResult
		}
	}
}

/**
 * Error boundary fallback component data
 */
export interface ErrorBoundaryFallbackProps {
	error: Error
	resetError: () => void
	componentName: string
}

/**
 * Generate error boundary fallback content
 */
export const generateErrorBoundaryFallback = (
	error: Error,
	componentName: string = "SmartInput"
): {
	title: string
	message: string
	suggestions: string[]
	canRecover: boolean
} => {
	return {
		title: `${componentName} Error`,
		message: `An error occurred in ${componentName}: ${error.message}`,
		suggestions: [
			"Try refreshing the page",
			"Check your input for invalid characters",
			"Verify environment variables are properly configured",
			"Contact support if the issue persists",
		],
		canRecover: true,
	}
}

/**
 * Sanitize input text to prevent common issues
 */
export const sanitizeInputText = (
	text: string,
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): { sanitizedText: string; warnings: SmartInputError[] } => {
	const warnings: SmartInputError[] = []
	let sanitizedText = text

	try {
		// Remove null characters
		if (sanitizedText.includes("\0")) {
			sanitizedText = sanitizedText.replace(/\0/g, "")
			warnings.push({
				type: SmartInputErrorType.MALFORMED_VARIABLE,
				message: "Null characters removed from input",
				recoverable: true,
			})
		}

		// Limit text length to prevent performance issues
		const maxLength = 10000
		if (sanitizedText.length > maxLength) {
			sanitizedText = sanitizedText.slice(0, maxLength)
			warnings.push({
				type: SmartInputErrorType.TEXT_MANIPULATION_ERROR,
				message: `Text truncated to ${maxLength} characters`,
				recoverable: true,
			})
		}

		// Fix common malformed patterns
		const fixes = [
			{
				pattern: /\{\{\{([^}]+)\}\}\}/g,
				replacement: "{{$1}}",
				message: "Triple braces converted to double braces",
			},
			{
				pattern: /\{([^{][^}]*)\}/g,
				replacement: "{{$1}}",
				message: "Single braces converted to double braces",
			},
		]

		fixes.forEach(({ pattern, replacement, message }) => {
			const originalText = sanitizedText
			sanitizedText = sanitizedText.replace(pattern, replacement)

			if (originalText !== sanitizedText) {
				warnings.push({
					type: SmartInputErrorType.MALFORMED_VARIABLE,
					message,
					recoverable: true,
				})
			}
		})
	} catch (error) {
		if (config.enableLogging) {
			console.error("Smart Input: Text sanitization failed", error)
		}

		warnings.push({
			type: SmartInputErrorType.TEXT_MANIPULATION_ERROR,
			message: `Text sanitization failed: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
			originalError: error instanceof Error ? error : undefined,
			recoverable: false,
		})
	}

	return { sanitizedText, warnings }
}

/**
 * Create error-safe wrapper for any function
 */
export const createErrorSafeWrapper = <T extends (...args: any[]) => any>(
	fn: T,
	fallbackValue: ReturnType<T>,
	errorType: SmartInputErrorType,
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
) => {
	return (...args: Parameters<T>): { result: ReturnType<T>; error?: SmartInputError } => {
		try {
			const result = fn(...args)
			return { result }
		} catch (error) {
			const errorInfo: SmartInputError = {
				type: errorType,
				message: `Operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				originalError: error instanceof Error ? error : undefined,
				recoverable: true,
			}

			if (config.enableLogging) {
				console.error(`Smart Input: ${errorType} failed`, error)
			}

			return { result: fallbackValue, error: errorInfo }
		}
	}
}

/**
 * Internal implementation of suggestion filtering with full fuzzy search logic
 */
const filterSuggestionsInternal = (
	variables: Record<string, string>,
	searchQuery: string
): SuggestionItem[] => {
	// Convert variables object to array of suggestion items
	const suggestions: SuggestionItem[] = Object.entries(variables).map(([key, value]) => ({
		key,
		value,
	}))

	// If no search query, return all suggestions sorted alphabetically
	if (!searchQuery.trim()) {
		return suggestions.sort((a, b) => a.key.localeCompare(b.key))
	}

	// Configure Fuse.js for fuzzy search with optimized settings
	const fuse = new Fuse(suggestions, {
		keys: [
			{
				name: "key",
				weight: 0.8, // Higher weight for key matching
			},
			{
				name: "value",
				weight: 0.2, // Lower weight for value matching
			},
		],
		threshold: 0.6, // More lenient for better matches
		includeScore: true,
		shouldSort: true,
		ignoreLocation: true, // Don't consider position of match
		findAllMatches: true,
		minMatchCharLength: 1,
		useExtendedSearch: false,
	})

	// Perform fuzzy search
	const results = fuse.search(searchQuery)

	// Enhanced ranking: prioritize exact prefix matches
	const rankedResults = results.map((result: FuseResult<SuggestionItem>) => {
		const item = result.item
		const score = result.score || 0

		// Boost score for exact prefix matches
		let adjustedScore = score
		if (item.key.toLowerCase().startsWith(searchQuery.toLowerCase())) {
			adjustedScore = score * 0.1 // Much better score for prefix matches
		} else if (item.key.toLowerCase().includes(searchQuery.toLowerCase())) {
			adjustedScore = score * 0.5 // Better score for substring matches
		}

		return {
			...item,
			score: adjustedScore,
		}
	})

	// Sort by adjusted score (lower is better in Fuse.js)
	return rankedResults.sort((a, b) => (a.score || 0) - (b.score || 0))
}
