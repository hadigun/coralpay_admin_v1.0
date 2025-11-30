/**
 * Utility functions for Smart Input component
 */

import { TextSegment, SuggestionTrigger, SuggestionItem } from "@/types/smart-input"
import Fuse from "fuse.js"
import { isValidVariableName, generateId } from "./smart-input-validation"

/**
 * Parse input text into segments identifying environment variables
 * This is for visual styling only - backend handles actual template processing
 * Enhanced with error handling and graceful degradation
 */
export const parseText = (
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
 * Enhanced parsing function that also detects malformed variable patterns
 */
export const parseTextWithMalformedDetection = (
	text: string,
	availableVariables: Record<string, string> = {}
): TextSegment[] => {
	const segments: TextSegment[] = []
	let lastIndex = 0

	// Pattern to match both complete and incomplete variable patterns
	const allPatterns = /(\{\{[^}]*\}\}|\{\{[^}]*$|\{\{)/g
	let match

	while ((match = allPatterns.exec(text)) !== null) {
		// Add text segment before this match
		if (match.index > lastIndex) {
			segments.push({
				id: generateId(),
				type: "text",
				content: text.slice(lastIndex, match.index),
				startIndex: lastIndex,
				endIndex: match.index,
			})
		}

		const matchedContent = match[0]

		// Check if this is a complete variable pattern
		if (matchedContent.startsWith("{{") && matchedContent.endsWith("}}")) {
			const variableName = matchedContent.slice(2, -2).trim()
			const isValid =
				isValidVariableName(variableName) && availableVariables.hasOwnProperty(variableName)

			segments.push({
				id: generateId(),
				type: isValid ? "variable" : "invalid-variable",
				content: matchedContent,
				startIndex: match.index,
				endIndex: match.index + matchedContent.length,
				variableName,
				isValid,
			})
		} else {
			// This is an incomplete or malformed pattern
			segments.push({
				id: generateId(),
				type: "invalid-variable",
				content: matchedContent,
				startIndex: match.index,
				endIndex: match.index + matchedContent.length,
				variableName: "",
				isValid: false,
			})
		}

		lastIndex = match.index + matchedContent.length
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
 * Get all variable segments from parsed text
 */
export const getVariableSegments = (segments: TextSegment[]): TextSegment[] => {
	return segments.filter(
		(segment) => segment.type === "variable" || segment.type === "invalid-variable"
	)
}

/**
 * Get all text segments from parsed text
 */
export const getTextSegments = (segments: TextSegment[]): TextSegment[] => {
	return segments.filter((segment) => segment.type === "text")
}

/**
 * Find segment at a specific position
 */
export const findSegmentAtPosition = (
	segments: TextSegment[],
	position: number
): TextSegment | null => {
	return (
		segments.find((segment) => position >= segment.startIndex && position <= segment.endIndex) ||
		null
	)
}

/**
 * Get variable names from segments
 */
export const getVariableNamesFromSegments = (segments: TextSegment[]): string[] => {
	return segments
		.filter((segment) => segment.variableName)
		.map((segment) => segment.variableName!)
		.filter((name, index, array) => array.indexOf(name) === index) // Remove duplicates
}

/**
 * Count segments by type
 */
export const countSegmentsByType = (
	segments: TextSegment[]
): {
	text: number
	variable: number
	invalidVariable: number
} => {
	return segments.reduce(
		(counts, segment) => {
			switch (segment.type) {
				case "text":
					counts.text++
					break
				case "variable":
					counts.variable++
					break
				case "invalid-variable":
					counts.invalidVariable++
					break
			}
			return counts
		},
		{ text: 0, variable: 0, invalidVariable: 0 }
	)
}

/**
 * Detect if suggestions should be triggered based on cursor position and text
 */
export const detectSuggestionTrigger = (
	text: string,
	cursorPosition: number
): SuggestionTrigger => {
	// Look for {{ pattern before cursor
	const beforeCursor = text.slice(0, cursorPosition)
	const match = beforeCursor.match(/\{\{([^}]*)$/)

	if (match && match[1] !== undefined) {
		return {
			shouldShow: true,
			triggerPosition: match.index! + 2, // Position after {{
			searchQuery: match[1],
		}
	}

	return {
		shouldShow: false,
		triggerPosition: -1,
		searchQuery: "",
	}
}

/**
 * Filter and rank environment variables based on search query using fuzzy search
 * Implements real-time filtering with advanced ranking and sorting
 * Enhanced with error handling and graceful degradation
 */
export const filterSuggestions = (
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
	const rankedResults = results.map((result) => {
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

/**
 * Advanced filtering with multiple search strategies
 * Combines exact matching, prefix matching, and fuzzy search
 */
export const filterSuggestionsAdvanced = (
	variables: Record<string, string>,
	searchQuery: string
): SuggestionItem[] => {
	const suggestions: SuggestionItem[] = Object.entries(variables).map(([key, value]) => ({
		key,
		value,
	}))

	if (!searchQuery.trim()) {
		return suggestions.sort((a, b) => a.key.localeCompare(b.key))
	}

	const query = searchQuery.toLowerCase()
	const exactMatches: SuggestionItem[] = []
	const prefixMatches: SuggestionItem[] = []
	const substringMatches: SuggestionItem[] = []
	const fuzzyMatches: SuggestionItem[] = []

	// First pass: categorize matches
	suggestions.forEach((suggestion) => {
		const key = suggestion.key.toLowerCase()

		if (key === query) {
			exactMatches.push({ ...suggestion, score: 0 })
		} else if (key.startsWith(query)) {
			prefixMatches.push({ ...suggestion, score: 0.1 })
		} else if (key.includes(query)) {
			substringMatches.push({ ...suggestion, score: 0.3 })
		}
	})

	// Second pass: fuzzy search for remaining items
	const remainingSuggestions = suggestions.filter((suggestion) => {
		const key = suggestion.key.toLowerCase()
		return !key.includes(query)
	})

	if (remainingSuggestions.length > 0) {
		const fuse = new Fuse(remainingSuggestions, {
			keys: ["key"],
			threshold: 0.6,
			includeScore: true,
			shouldSort: true,
		})

		const fuzzyResults = fuse.search(searchQuery)
		fuzzyResults.forEach((result) => {
			fuzzyMatches.push({
				...result.item,
				score: (result.score || 0) + 0.5, // Offset to rank after substring matches
			})
		})
	}

	// Combine all matches in priority order
	const allMatches = [
		...exactMatches,
		...prefixMatches.sort((a, b) => a.key.localeCompare(b.key)),
		...substringMatches.sort((a, b) => a.key.localeCompare(b.key)),
		...fuzzyMatches,
	]

	return allMatches
}

/**
 * Insert a variable at the specified position in text
 */
export const insertVariable = (
	text: string,
	variableKey: string,
	triggerPosition: number,
	searchQuery: string
): { newText: string; newCursorPosition: number } => {
	// Calculate the position where {{ starts
	const startPosition = triggerPosition - 2

	// Calculate the position where the search query ends
	const endPosition = triggerPosition + searchQuery.length

	// Create the variable reference
	const variableReference = `{{${variableKey}}}`

	// Replace the text from {{ to the end of search query
	const newText = text.slice(0, startPosition) + variableReference + text.slice(endPosition)

	// Calculate new cursor position (after the inserted variable)
	const newCursorPosition = startPosition + variableReference.length

	return {
		newText,
		newCursorPosition,
	}
}

/**
 * Validate if a string contains valid environment variable syntax
 */
export const validateVariableSyntax = (text: string): boolean => {
	const variablePattern = /^\{\{[^{}]+\}\}$/
	return variablePattern.test(text)
}

/**
 * Extract variable name from a variable reference
 */
export const extractVariableName = (variableReference: string): string | null => {
	const match = variableReference.match(/^\{\{([^{}]+)\}\}$/)
	return match ? match[1] : null
}

/**
 * Check if cursor is within a variable reference
 */
export const isCursorInVariable = (
	segments: TextSegment[],
	cursorPosition: number
): { isInVariable: boolean; segment?: TextSegment } => {
	for (const segment of segments) {
		if (
			(segment.type === "variable" || segment.type === "invalid-variable") &&
			cursorPosition >= segment.startIndex &&
			cursorPosition <= segment.endIndex
		) {
			return { isInVariable: true, segment }
		}
	}
	return { isInVariable: false }
}

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
	func: T,
	delay: number
): ((...args: Parameters<T>) => void) => {
	let timeoutId: NodeJS.Timeout

	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => func(...args), delay)
	}
}

/**
 * Create a memoized Fuse.js instance for better performance with large datasets
 */
export const createMemoizedFuseInstance = (variables: Record<string, string>) => {
	const suggestions: SuggestionItem[] = Object.entries(variables).map(([key, value]) => ({
		key,
		value,
	}))

	return new Fuse(suggestions, {
		keys: [
			{
				name: "key",
				weight: 0.8,
			},
			{
				name: "value",
				weight: 0.2,
			},
		],
		threshold: 0.6,
		includeScore: true,
		shouldSort: true,
		ignoreLocation: true,
		findAllMatches: true,
		minMatchCharLength: 1,
	})
}

/**
 * Optimized filtering for real-time use with caching
 */
export const filterSuggestionsOptimized = (
	fuseInstance: Fuse<SuggestionItem>,
	searchQuery: string,
	maxResults: number = 10
): SuggestionItem[] => {
	if (!searchQuery.trim()) {
		// Return all items sorted alphabetically, limited by maxResults
		// Use empty search to get all items, then sort and limit
		const allResults = fuseInstance.search("", { limit: maxResults * 2 })
		return allResults
			.map((result) => result.item)
			.sort((a: SuggestionItem, b: SuggestionItem) => a.key.localeCompare(b.key))
			.slice(0, maxResults)
	}

	// Perform search and limit results
	const results = fuseInstance.search(searchQuery, { limit: maxResults })

	return results
		.map((result) => {
			const item = result.item
			const score = result.score || 0

			// Apply ranking boost for prefix matches
			let adjustedScore = score
			if (item.key.toLowerCase().startsWith(searchQuery.toLowerCase())) {
				adjustedScore = score * 0.1
			} else if (item.key.toLowerCase().includes(searchQuery.toLowerCase())) {
				adjustedScore = score * 0.5
			}

			return {
				...item,
				score: adjustedScore,
			}
		})
		.sort((a, b) => (a.score || 0) - (b.score || 0))
}
/**
 * Enhanced variable insertion with automatic completion and validation
 */
export const insertVariableEnhanced = (
	text: string,
	variableKey: string,
	triggerPosition: number,
	searchQuery: string,
	autoComplete: boolean = true
): { newText: string; newCursorPosition: number; success: boolean } => {
	try {
		// Calculate the position where {{ starts
		const startPosition = triggerPosition - 2

		// Validate positions
		if (startPosition < 0 || triggerPosition > text.length) {
			return { newText: text, newCursorPosition: triggerPosition, success: false }
		}

		// Calculate the position where the search query ends
		const endPosition = triggerPosition + searchQuery.length

		// Create the variable reference with automatic }} completion
		const variableReference = autoComplete ? `{{${variableKey}}}` : `${variableKey}`

		// Replace the text from {{ to the end of search query
		const newText = text.slice(0, startPosition) + variableReference + text.slice(endPosition)

		// Calculate new cursor position (after the inserted variable)
		const newCursorPosition = startPosition + variableReference.length

		return {
			newText,
			newCursorPosition,
			success: true,
		}
	} catch (error) {
		console.error("Error inserting variable:", error)
		return { newText: text, newCursorPosition: triggerPosition, success: false }
	}
}

/**
 * Smart insertion that handles edge cases and partial completions
 */
export const insertVariableSmart = (
	text: string,
	variableKey: string,
	cursorPosition: number
): { newText: string; newCursorPosition: number; success: boolean } => {
	// Detect if we're in the middle of a variable pattern
	const trigger = detectSuggestionTrigger(text, cursorPosition)

	if (trigger.shouldShow) {
		return insertVariableEnhanced(
			text,
			variableKey,
			trigger.triggerPosition,
			trigger.searchQuery,
			true
		)
	}

	// If not in a trigger context, insert at cursor position
	const variableReference = `{{${variableKey}}}`
	const newText = text.slice(0, cursorPosition) + variableReference + text.slice(cursorPosition)
	const newCursorPosition = cursorPosition + variableReference.length

	return {
		newText,
		newCursorPosition,
		success: true,
	}
}

/**
 * Text Manipulation Utilities for SmartInput
 * These utilities handle cursor positioning, text editing, and copy/paste operations
 */

/**
 * Get the position within a variable reference where the cursor should be placed
 */
export const getCursorPositionInVariable = (
	segment: TextSegment,
	absolutePosition: number
): {
	isInVariableName: boolean
	relativePosition: number
	variableNameStart: number
	variableNameEnd: number
} => {
	if (segment.type !== "variable" && segment.type !== "invalid-variable") {
		return {
			isInVariableName: false,
			relativePosition: 0,
			variableNameStart: 0,
			variableNameEnd: 0,
		}
	}

	// Variable format: {{variableName}}
	const variableNameStart = segment.startIndex + 2 // After {{
	const variableNameEnd = segment.endIndex - 2 // Before }}

	const isInVariableName =
		absolutePosition >= variableNameStart && absolutePosition <= variableNameEnd
	const relativePosition = absolutePosition - variableNameStart

	return {
		isInVariableName,
		relativePosition: Math.max(0, relativePosition),
		variableNameStart,
		variableNameEnd,
	}
}

/**
 * Handle partial variable deletion with smart behavior
 */
export const handlePartialVariableDeletion = (
	text: string,
	segments: TextSegment[],
	selectionStart: number,
	selectionEnd: number,
	deleteDirection: "forward" | "backward" = "backward"
): {
	newText: string
	newCursorPosition: number
	deletedVariable: boolean
} => {
	// Find segments that intersect with the selection
	const affectedSegments = segments.filter(
		(segment) =>
			(segment.startIndex < selectionEnd && segment.endIndex > selectionStart) ||
			(segment.startIndex >= selectionStart && segment.startIndex < selectionEnd)
	)

	// Check if any variable segments are affected
	const variableSegments = affectedSegments.filter(
		(segment) => segment.type === "variable" || segment.type === "invalid-variable"
	)

	if (variableSegments.length === 0) {
		// No variables affected, perform normal deletion
		const newText = text.slice(0, selectionStart) + text.slice(selectionEnd)
		return {
			newText,
			newCursorPosition: selectionStart,
			deletedVariable: false,
		}
	}

	// If deleting part of a variable, delete the entire variable
	let newText = text
	let cursorPosition = selectionStart
	let deletedVariable = false

	// Process variables from right to left to maintain correct positions
	const sortedVariables = [...variableSegments].sort((a, b) => b.startIndex - a.startIndex)

	for (const segment of sortedVariables) {
		// Check if the selection intersects with this variable
		const intersects =
			(selectionStart < segment.endIndex && selectionEnd > segment.startIndex) ||
			(selectionStart >= segment.startIndex && selectionStart < segment.endIndex)

		if (intersects) {
			// Delete the entire variable
			newText = newText.slice(0, segment.startIndex) + newText.slice(segment.endIndex)
			cursorPosition = segment.startIndex
			deletedVariable = true
		}
	}

	return {
		newText,
		newCursorPosition: cursorPosition,
		deletedVariable,
	}
}

/**
 * Handle text insertion at cursor position with variable awareness
 */
export const insertTextWithVariableAwareness = (
	text: string,
	insertText: string,
	cursorPosition: number,
	segments: TextSegment[]
): {
	newText: string
	newCursorPosition: number
	insertedInVariable: boolean
} => {
	// Check if cursor is within a variable
	const cursorInfo = isCursorInVariable(segments, cursorPosition)

	if (cursorInfo.isInVariable && cursorInfo.segment) {
		const segment = cursorInfo.segment
		const positionInfo = getCursorPositionInVariable(segment, cursorPosition)

		if (positionInfo.isInVariableName) {
			// Insert text within the variable name
			const variableName = segment.variableName || ""
			const beforeCursor = variableName.slice(0, positionInfo.relativePosition)
			const afterCursor = variableName.slice(positionInfo.relativePosition)
			const newVariableName = beforeCursor + insertText + afterCursor

			// Replace the entire variable with the updated one
			const newVariableReference = `{{${newVariableName}}}`
			const newText =
				text.slice(0, segment.startIndex) + newVariableReference + text.slice(segment.endIndex)

			const newCursorPosition = segment.startIndex + 2 + beforeCursor.length + insertText.length

			return {
				newText,
				newCursorPosition,
				insertedInVariable: true,
			}
		}
	}

	// Normal text insertion
	const newText = text.slice(0, cursorPosition) + insertText + text.slice(cursorPosition)
	const newCursorPosition = cursorPosition + insertText.length

	return {
		newText,
		newCursorPosition,
		insertedInVariable: false,
	}
}

/**
 * Handle copy operation with variable preservation
 */
export const copyTextWithVariables = (
	text: string,
	selectionStart: number,
	selectionEnd: number,
	segments: TextSegment[]
): {
	copiedText: string
	containsVariables: boolean
	variableCount: number
} => {
	const copiedText = text.slice(selectionStart, selectionEnd)

	// Find segments within the selection
	const selectedSegments = segments.filter(
		(segment) =>
			segment.startIndex >= selectionStart &&
			segment.endIndex <= selectionEnd &&
			(segment.type === "variable" || segment.type === "invalid-variable")
	)

	return {
		copiedText,
		containsVariables: selectedSegments.length > 0,
		variableCount: selectedSegments.length,
	}
}

/**
 * Handle paste operation with variable recognition
 */
export const pasteTextWithVariableRecognition = (
	currentText: string,
	pastedText: string,
	cursorPosition: number,
	availableVariables: Record<string, string>
): {
	newText: string
	newCursorPosition: number
	recognizedVariables: string[]
	invalidVariables: string[]
} => {
	// Insert the pasted text
	const newText =
		currentText.slice(0, cursorPosition) + pastedText + currentText.slice(cursorPosition)
	const newCursorPosition = cursorPosition + pastedText.length

	// Parse the pasted text to identify variables
	const pastedSegments = parseText(pastedText, availableVariables)
	const variableSegments = pastedSegments.filter(
		(segment) => segment.type === "variable" || segment.type === "invalid-variable"
	)

	const recognizedVariables: string[] = []
	const invalidVariables: string[] = []

	variableSegments.forEach((segment) => {
		if (segment.variableName) {
			if (segment.type === "variable") {
				recognizedVariables.push(segment.variableName)
			} else {
				invalidVariables.push(segment.variableName)
			}
		}
	})

	return {
		newText,
		newCursorPosition,
		recognizedVariables: [...new Set(recognizedVariables)], // Remove duplicates
		invalidVariables: [...new Set(invalidVariables)], // Remove duplicates
	}
}

/**
 * Smart cursor positioning that respects variable boundaries
 */
export const getSmartCursorPosition = (
	text: string,
	targetPosition: number,
	segments: TextSegment[],
	direction: "left" | "right" = "right"
): number => {
	// Find the segment at the target position
	const segment = findSegmentAtPosition(segments, targetPosition)

	if (!segment || segment.type === "text") {
		return Math.max(0, Math.min(targetPosition, text.length))
	}

	// If in a variable segment, position cursor at variable boundaries
	if (segment.type === "variable" || segment.type === "invalid-variable") {
		if (direction === "left") {
			// Position at the start of the variable
			return segment.startIndex
		} else {
			// Position at the end of the variable
			return segment.endIndex
		}
	}

	return Math.max(0, Math.min(targetPosition, text.length))
}

/**
 * Handle undo/redo operations with proper state management
 */
export interface TextHistoryState {
	text: string
	cursorPosition: number
	timestamp: number
}

export class TextHistory {
	private history: TextHistoryState[] = []
	private currentIndex: number = -1
	private maxHistorySize: number = 50

	constructor(maxHistorySize: number = 50) {
		this.maxHistorySize = maxHistorySize
	}

	/**
	 * Add a new state to history
	 */
	addState(text: string, cursorPosition: number): void {
		const newState: TextHistoryState = {
			text,
			cursorPosition,
			timestamp: Date.now(),
		}

		// Remove any states after current index (when adding after undo)
		this.history = this.history.slice(0, this.currentIndex + 1)

		// Add new state
		this.history.push(newState)
		this.currentIndex = this.history.length - 1

		// Limit history size
		if (this.history.length > this.maxHistorySize) {
			this.history = this.history.slice(-this.maxHistorySize)
			this.currentIndex = this.history.length - 1
		}
	}

	/**
	 * Undo to previous state
	 */
	undo(): TextHistoryState | null {
		if (this.currentIndex > 0) {
			this.currentIndex--
			return this.history[this.currentIndex]
		}
		return null
	}

	/**
	 * Redo to next state
	 */
	redo(): TextHistoryState | null {
		if (this.currentIndex < this.history.length - 1) {
			this.currentIndex++
			return this.history[this.currentIndex]
		}
		return null
	}

	/**
	 * Check if undo is available
	 */
	canUndo(): boolean {
		return this.currentIndex > 0
	}

	/**
	 * Check if redo is available
	 */
	canRedo(): boolean {
		return this.currentIndex < this.history.length - 1
	}

	/**
	 * Get current state
	 */
	getCurrentState(): TextHistoryState | null {
		return this.history[this.currentIndex] || null
	}

	/**
	 * Clear history
	 */
	clear(): void {
		this.history = []
		this.currentIndex = -1
	}
}

/**
 * Utility to handle programmatic value updates while preserving cursor position
 */
export const updateValueProgrammatically = (
	currentText: string,
	newText: string,
	currentCursorPosition: number,
	segments: TextSegment[]
): {
	newCursorPosition: number
	textChanged: boolean
} => {
	if (currentText === newText) {
		return {
			newCursorPosition: currentCursorPosition,
			textChanged: false,
		}
	}

	// Try to maintain cursor position relative to content
	let newCursorPosition = currentCursorPosition

	// If text is shorter, adjust cursor position
	if (newText.length < currentText.length) {
		newCursorPosition = Math.min(currentCursorPosition, newText.length)
	}

	// If cursor was in a variable, try to maintain relative position
	const cursorInfo = isCursorInVariable(segments, currentCursorPosition)
	if (cursorInfo.isInVariable && cursorInfo.segment) {
		const newSegments = parseText(newText)
		const correspondingSegment = newSegments.find(
			(seg) =>
				seg.variableName === cursorInfo.segment?.variableName &&
				(seg.type === "variable" || seg.type === "invalid-variable")
		)

		if (correspondingSegment) {
			const positionInfo = getCursorPositionInVariable(cursorInfo.segment, currentCursorPosition)
			newCursorPosition = correspondingSegment.startIndex + 2 + positionInfo.relativePosition
		}
	}

	return {
		newCursorPosition: Math.max(0, Math.min(newCursorPosition, newText.length)),
		textChanged: true,
	}
}

/**
 * Handle text selection across variable boundaries
 */
export const handleTextSelection = (
	text: string,
	selectionStart: number,
	selectionEnd: number,
	segments: TextSegment[],
	snapToVariables: boolean = true
): {
	adjustedStart: number
	adjustedEnd: number
	selectedVariables: TextSegment[]
	selectedText: string
} => {
	let adjustedStart = selectionStart
	let adjustedEnd = selectionEnd

	if (snapToVariables) {
		// Find segments that intersect with selection
		const intersectingSegments = segments.filter(
			(segment) =>
				segment.startIndex < selectionEnd &&
				segment.endIndex > selectionStart &&
				(segment.type === "variable" || segment.type === "invalid-variable")
		)

		// Expand selection to include complete variables
		if (intersectingSegments.length > 0) {
			const minStart = Math.min(...intersectingSegments.map((seg) => seg.startIndex))
			const maxEnd = Math.max(...intersectingSegments.map((seg) => seg.endIndex))

			adjustedStart = Math.min(adjustedStart, minStart)
			adjustedEnd = Math.max(adjustedEnd, maxEnd)
		}
	}

	// Get selected variables
	const selectedVariables = segments.filter(
		(segment) =>
			segment.startIndex >= adjustedStart &&
			segment.endIndex <= adjustedEnd &&
			(segment.type === "variable" || segment.type === "invalid-variable")
	)

	const selectedText = text.slice(adjustedStart, adjustedEnd)

	return {
		adjustedStart,
		adjustedEnd,
		selectedVariables,
		selectedText,
	}
}
