/**
 * Advanced text editing utilities for Smart Input component
 * Handles complex text editing scenarios including undo/redo, cursor positioning,
 * text selection across variable boundaries, and programmatic value updates
 */

import { TextSegment } from "@/types/smart-input"
import {
	isCursorInVariable,
	getCursorPositionInVariable,
	findSegmentAtPosition,
	parseText,
} from "./smart-input-utils"
import {
	validateCursorPosition,
	DEFAULT_ERROR_CONFIG,
	ErrorHandlerConfig,
} from "./smart-input-error-handling"

/**
 * Enhanced text history state with metadata
 */
export interface AdvancedTextHistoryState {
	text: string
	cursorPosition: number
	selectionStart: number
	selectionEnd: number
	timestamp: number
	changeType: "insert" | "delete" | "replace" | "paste" | "programmatic"
	metadata?: {
		insertedText?: string
		deletedText?: string
		variablesAffected?: string[]
	}
}

/**
 * Enhanced text history class with better state management
 */
export class AdvancedTextHistory {
	private history: AdvancedTextHistoryState[] = []
	private currentIndex: number = -1
	private maxHistorySize: number = 100
	private mergeTimeWindow: number = 1000 // 1 second
	private lastChangeTime: number = 0

	constructor(maxHistorySize: number = 100, mergeTimeWindow: number = 1000) {
		this.maxHistorySize = maxHistorySize
		this.mergeTimeWindow = mergeTimeWindow
	}

	/**
	 * Add a new state to history with intelligent merging
	 */
	addState(
		text: string,
		cursorPosition: number,
		selectionStart: number = cursorPosition,
		selectionEnd: number = cursorPosition,
		changeType: AdvancedTextHistoryState["changeType"] = "insert",
		metadata?: AdvancedTextHistoryState["metadata"]
	): void {
		const now = Date.now()
		const newState: AdvancedTextHistoryState = {
			text,
			cursorPosition,
			selectionStart,
			selectionEnd,
			timestamp: now,
			changeType,
			metadata,
		}

		// Check if we should merge with the previous state
		const shouldMerge = this.shouldMergeWithPrevious(newState, now)

		if (shouldMerge && this.currentIndex >= 0) {
			// Update the current state instead of adding a new one
			this.history[this.currentIndex] = newState
		} else {
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

		this.lastChangeTime = now
	}

	/**
	 * Determine if the new state should be merged with the previous one
	 */
	private shouldMergeWithPrevious(newState: AdvancedTextHistoryState, now: number): boolean {
		if (this.currentIndex < 0) return false

		const previousState = this.history[this.currentIndex]
		const timeDiff = now - previousState.timestamp

		// Don't merge if too much time has passed
		if (timeDiff > this.mergeTimeWindow) return false

		// Don't merge different change types
		if (previousState.changeType !== newState.changeType) return false

		// Don't merge programmatic changes
		if (newState.changeType === "programmatic") return false

		// Merge consecutive character insertions at the same position
		if (
			newState.changeType === "insert" &&
			Math.abs(newState.cursorPosition - previousState.cursorPosition) <= 1
		) {
			return true
		}

		// Merge consecutive character deletions
		if (
			newState.changeType === "delete" &&
			Math.abs(newState.cursorPosition - previousState.cursorPosition) <= 1
		) {
			return true
		}

		return false
	}

	/**
	 * Undo to previous state
	 */
	undo(): AdvancedTextHistoryState | null {
		if (this.currentIndex > 0) {
			this.currentIndex--
			return this.history[this.currentIndex]
		}
		return null
	}

	/**
	 * Redo to next state
	 */
	redo(): AdvancedTextHistoryState | null {
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
	getCurrentState(): AdvancedTextHistoryState | null {
		return this.history[this.currentIndex] || null
	}

	/**
	 * Clear history
	 */
	clear(): void {
		this.history = []
		this.currentIndex = -1
		this.lastChangeTime = 0
	}

	/**
	 * Get history statistics
	 */
	getStats(): {
		totalStates: number
		currentIndex: number
		canUndo: boolean
		canRedo: boolean
		memoryUsage: number
	} {
		return {
			totalStates: this.history.length,
			currentIndex: this.currentIndex,
			canUndo: this.canUndo(),
			canRedo: this.canRedo(),
			memoryUsage: JSON.stringify(this.history).length,
		}
	}
}

/**
 * Enhanced cursor positioning that handles edge cases within variable references
 */
export const getAdvancedCursorPosition = (
	text: string,
	targetPosition: number,
	segments: TextSegment[],
	direction: "left" | "right" = "right",
	snapToVariables: boolean = true,
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): {
	position: number
	isInVariable: boolean
	variableSegment?: TextSegment
	adjustmentMade: boolean
} => {
	// Validate cursor position first
	const { position: validatedPosition, error } = validateCursorPosition(
		targetPosition,
		text.length,
		config
	)

	if (error && config.enableLogging) {
		console.warn("Cursor position validation:", error)
	}

	let finalPosition = validatedPosition
	let adjustmentMade = validatedPosition !== targetPosition

	// Find the segment at the target position
	const segment = findSegmentAtPosition(segments, finalPosition)
	const cursorInfo = isCursorInVariable(segments, finalPosition)

	if (!snapToVariables || !segment || segment.type === "text") {
		return {
			position: finalPosition,
			isInVariable: false,
			adjustmentMade,
		}
	}

	// Handle cursor positioning within variables
	if (cursorInfo.isInVariable && cursorInfo.segment) {
		const variableSegment = cursorInfo.segment
		const positionInfo = getCursorPositionInVariable(variableSegment, finalPosition)

		// If cursor is at the edge of a variable, decide where to position it
		if (positionInfo.isInVariableName) {
			// Allow cursor within variable name for editing
			return {
				position: finalPosition,
				isInVariable: true,
				variableSegment,
				adjustmentMade,
			}
		} else {
			// Position cursor at variable boundaries
			if (direction === "left") {
				finalPosition = variableSegment.startIndex
			} else {
				finalPosition = variableSegment.endIndex
			}
			adjustmentMade = true
		}
	}

	return {
		position: finalPosition,
		isInVariable: cursorInfo.isInVariable,
		variableSegment: cursorInfo.segment,
		adjustmentMade,
	}
}

/**
 * Enhanced text selection handling across variable boundaries
 */
export const handleAdvancedTextSelection = (
	text: string,
	selectionStart: number,
	selectionEnd: number,
	segments: TextSegment[],
	options: {
		snapToVariables?: boolean
		expandToCompleteVariables?: boolean
		allowPartialVariableSelection?: boolean
	} = {},
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): {
	adjustedStart: number
	adjustedEnd: number
	selectedVariables: TextSegment[]
	selectedText: string
	adjustmentMade: boolean
	warnings: string[]
} => {
	const {
		snapToVariables = true,
		expandToCompleteVariables = true,
		allowPartialVariableSelection = false,
	} = options

	let adjustedStart = selectionStart
	let adjustedEnd = selectionEnd
	let adjustmentMade = false
	const warnings: string[] = []

	// Validate selection bounds
	const startValidation = validateCursorPosition(selectionStart, text.length, config)
	const endValidation = validateCursorPosition(selectionEnd, text.length, config)

	if (startValidation.error) {
		adjustedStart = startValidation.position
		adjustmentMade = true
		warnings.push(`Selection start adjusted: ${startValidation.error.message}`)
	}

	if (endValidation.error) {
		adjustedEnd = endValidation.position
		adjustmentMade = true
		warnings.push(`Selection end adjusted: ${endValidation.error.message}`)
	}

	// Ensure start <= end
	if (adjustedStart > adjustedEnd) {
		;[adjustedStart, adjustedEnd] = [adjustedEnd, adjustedStart]
		adjustmentMade = true
		warnings.push("Selection start and end were swapped")
	}

	if (snapToVariables && expandToCompleteVariables) {
		// Find segments that intersect with selection
		const intersectingSegments = segments.filter(
			(segment) =>
				segment.startIndex < adjustedEnd &&
				segment.endIndex > adjustedStart &&
				(segment.type === "variable" || segment.type === "invalid-variable")
		)

		if (intersectingSegments.length > 0) {
			if (!allowPartialVariableSelection) {
				// Expand selection to include complete variables
				const minStart = Math.min(
					adjustedStart,
					...intersectingSegments.map((seg) => seg.startIndex)
				)
				const maxEnd = Math.max(adjustedEnd, ...intersectingSegments.map((seg) => seg.endIndex))

				if (minStart !== adjustedStart || maxEnd !== adjustedEnd) {
					adjustedStart = minStart
					adjustedEnd = maxEnd
					adjustmentMade = true
					warnings.push("Selection expanded to include complete variables")
				}
			} else {
				// Check if selection partially covers variables and warn
				intersectingSegments.forEach((segment) => {
					const partiallySelected =
						(adjustedStart > segment.startIndex && adjustedStart < segment.endIndex) ||
						(adjustedEnd > segment.startIndex && adjustedEnd < segment.endIndex)

					if (partiallySelected) {
						warnings.push(`Partial selection of variable: ${segment.variableName}`)
					}
				})
			}
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
		adjustmentMade,
		warnings,
	}
}

/**
 * Enhanced programmatic value updates with intelligent cursor positioning
 */
export const updateValueProgrammaticallyAdvanced = (
	currentText: string,
	newText: string,
	currentCursorPosition: number,
	currentSelectionStart: number,
	currentSelectionEnd: number,
	segments: TextSegment[],
	options: {
		preserveCursorPosition?: boolean
		maintainRelativePosition?: boolean
		snapToVariables?: boolean
	} = {},
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): {
	newCursorPosition: number
	newSelectionStart: number
	newSelectionEnd: number
	textChanged: boolean
	cursorAdjusted: boolean
	variableChanges: {
		added: string[]
		removed: string[]
		modified: string[]
	}
} => {
	const {
		preserveCursorPosition = true,
		maintainRelativePosition = true,
		snapToVariables = true,
	} = options

	if (currentText === newText) {
		return {
			newCursorPosition: currentCursorPosition,
			newSelectionStart: currentSelectionStart,
			newSelectionEnd: currentSelectionEnd,
			textChanged: false,
			cursorAdjusted: false,
			variableChanges: { added: [], removed: [], modified: [] },
		}
	}

	// Parse both old and new text to detect variable changes
	const oldSegments = segments
	const newSegments = parseText(newText)

	const oldVariables = oldSegments
		.filter((seg) => seg.type === "variable" && seg.variableName)
		.map((seg) => seg.variableName!)

	const newVariables = newSegments
		.filter((seg) => seg.type === "variable" && seg.variableName)
		.map((seg) => seg.variableName!)

	const variableChanges = {
		added: newVariables.filter((v) => !oldVariables.includes(v)),
		removed: oldVariables.filter((v) => !newVariables.includes(v)),
		modified: [], // Could be enhanced to detect variable content changes
	}

	let newCursorPosition = currentCursorPosition
	let newSelectionStart = currentSelectionStart
	let newSelectionEnd = currentSelectionEnd
	let cursorAdjusted = false

	if (preserveCursorPosition) {
		// Try to maintain cursor position relative to content
		if (newText.length < currentText.length) {
			// Text was shortened, adjust cursor position
			newCursorPosition = Math.min(currentCursorPosition, newText.length)
			newSelectionStart = Math.min(currentSelectionStart, newText.length)
			newSelectionEnd = Math.min(currentSelectionEnd, newText.length)
			cursorAdjusted = true
		} else if (maintainRelativePosition) {
			// Try to maintain relative position within variables
			const cursorInfo = isCursorInVariable(oldSegments, currentCursorPosition)

			if (cursorInfo.isInVariable && cursorInfo.segment) {
				const oldVariableName = cursorInfo.segment.variableName
				const correspondingSegment = newSegments.find(
					(seg) =>
						seg.variableName === oldVariableName &&
						(seg.type === "variable" || seg.type === "invalid-variable")
				)

				if (correspondingSegment) {
					const positionInfo = getCursorPositionInVariable(
						cursorInfo.segment,
						currentCursorPosition
					)
					newCursorPosition = correspondingSegment.startIndex + 2 + positionInfo.relativePosition
					cursorAdjusted = true
				}
			}
		}

		// Apply cursor position validation and snapping
		if (snapToVariables) {
			const advancedPosition = getAdvancedCursorPosition(
				newText,
				newCursorPosition,
				newSegments,
				"right",
				true,
				config
			)

			if (advancedPosition.adjustmentMade) {
				newCursorPosition = advancedPosition.position
				cursorAdjusted = true
			}
		}

		// Validate final positions
		const cursorValidation = validateCursorPosition(newCursorPosition, newText.length, config)
		const startValidation = validateCursorPosition(newSelectionStart, newText.length, config)
		const endValidation = validateCursorPosition(newSelectionEnd, newText.length, config)

		if (cursorValidation.error) {
			newCursorPosition = cursorValidation.position
			cursorAdjusted = true
		}

		if (startValidation.error) {
			newSelectionStart = startValidation.position
			cursorAdjusted = true
		}

		if (endValidation.error) {
			newSelectionEnd = endValidation.position
			cursorAdjusted = true
		}
	}

	return {
		newCursorPosition,
		newSelectionStart,
		newSelectionEnd,
		textChanged: true,
		cursorAdjusted,
		variableChanges,
	}
}

/**
 * Enhanced text insertion with variable awareness and conflict resolution
 */
export const insertTextAdvanced = (
	text: string,
	insertText: string,
	cursorPosition: number,
	segments: TextSegment[],
	options: {
		replaceSelection?: boolean
		selectionStart?: number
		selectionEnd?: number
		autoCompleteVariables?: boolean
		preventVariableCorruption?: boolean
	} = {},
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): {
	newText: string
	newCursorPosition: number
	insertedInVariable: boolean
	variableCorrupted: boolean
	autoCompletedVariable?: string
	warnings: string[]
} => {
	const {
		replaceSelection = false,
		selectionStart = cursorPosition,
		selectionEnd = cursorPosition,
		autoCompleteVariables = true,
		preventVariableCorruption = true,
	} = options

	const warnings: string[] = []
	let variableCorrupted = false
	let autoCompletedVariable: string | undefined

	// Validate cursor position
	const { position: validatedPosition, error } = validateCursorPosition(
		cursorPosition,
		text.length,
		config
	)

	if (error) {
		warnings.push(`Cursor position adjusted: ${error.message}`)
	}

	const insertPosition = replaceSelection ? selectionStart : validatedPosition
	const endPosition = replaceSelection ? selectionEnd : validatedPosition

	// Check if insertion would corrupt a variable
	const cursorInfo = isCursorInVariable(segments, insertPosition)

	if (cursorInfo.isInVariable && cursorInfo.segment && preventVariableCorruption) {
		const segment = cursorInfo.segment
		const positionInfo = getCursorPositionInVariable(segment, insertPosition)

		if (!positionInfo.isInVariableName) {
			// Insertion at variable boundary - position outside the variable
			const newPosition =
				insertPosition <= segment.startIndex + 2 ? segment.startIndex : segment.endIndex

			const newText = text.slice(0, newPosition) + insertText + text.slice(newPosition)

			return {
				newText,
				newCursorPosition: newPosition + insertText.length,
				insertedInVariable: false,
				variableCorrupted: false,
				warnings: [...warnings, "Insertion moved to avoid variable corruption"],
			}
		}
	}

	// Handle variable auto-completion
	if (autoCompleteVariables && insertText.includes("{{") && !insertText.includes("}}")) {
		// Check if this looks like the start of a variable
		const variableMatch = insertText.match(/\{\{([^}]*)$/)
		if (variableMatch) {
			insertText += "}}"
			autoCompletedVariable = variableMatch[1]
			warnings.push("Auto-completed variable braces")
		}
	}

	// Perform the insertion
	let newText: string
	let newCursorPosition: number

	if (replaceSelection && selectionStart !== selectionEnd) {
		// Replace selected text
		newText = text.slice(0, selectionStart) + insertText + text.slice(selectionEnd)
		newCursorPosition = selectionStart + insertText.length
	} else {
		// Insert at cursor position
		newText = text.slice(0, insertPosition) + insertText + text.slice(endPosition)
		newCursorPosition = insertPosition + insertText.length
	}

	// Check if any variables were corrupted by the insertion
	const newSegments = parseText(newText)
	const invalidVariables = newSegments.filter((seg) => seg.type === "invalid-variable")

	if (invalidVariables.length > 0) {
		variableCorrupted = true
		warnings.push(`Insertion may have corrupted ${invalidVariables.length} variable(s)`)
	}

	return {
		newText,
		newCursorPosition,
		insertedInVariable: cursorInfo.isInVariable,
		variableCorrupted,
		autoCompletedVariable,
		warnings,
	}
}

/**
 * Enhanced text deletion with variable preservation
 */
export const deleteTextAdvanced = (
	text: string,
	selectionStart: number,
	selectionEnd: number,
	segments: TextSegment[],
	options: {
		deleteDirection?: "forward" | "backward"
		preserveVariables?: boolean
		deleteCompleteVariables?: boolean
	} = {},
	config: ErrorHandlerConfig = DEFAULT_ERROR_CONFIG
): {
	newText: string
	newCursorPosition: number
	deletedVariables: TextSegment[]
	partiallyDeletedVariables: TextSegment[]
	warnings: string[]
} => {
	const {
		deleteDirection = "backward",
		preserveVariables = true,
		deleteCompleteVariables = true,
	} = options

	const warnings: string[] = []
	const deletedVariables: TextSegment[] = []
	const partiallyDeletedVariables: TextSegment[] = []

	// Validate selection bounds
	const startValidation = validateCursorPosition(selectionStart, text.length, config)
	const endValidation = validateCursorPosition(selectionEnd, text.length, config)

	let validatedStart = startValidation.position
	let validatedEnd = endValidation.position

	if (startValidation.error) {
		warnings.push(`Selection start adjusted: ${startValidation.error.message}`)
	}

	if (endValidation.error) {
		warnings.push(`Selection end adjusted: ${endValidation.error.message}`)
	}

	// Ensure start <= end
	if (validatedStart > validatedEnd) {
		;[validatedStart, validatedEnd] = [validatedEnd, validatedStart]
	}

	// Find affected segments
	const affectedSegments = segments.filter(
		(segment) =>
			(segment.startIndex < validatedEnd && segment.endIndex > validatedStart) ||
			(segment.startIndex >= validatedStart && segment.startIndex < validatedEnd)
	)

	const variableSegments = affectedSegments.filter(
		(segment) => segment.type === "variable" || segment.type === "invalid-variable"
	)

	if (preserveVariables && variableSegments.length > 0) {
		// Handle variable preservation logic
		for (const segment of variableSegments) {
			const isCompletelySelected =
				validatedStart <= segment.startIndex && validatedEnd >= segment.endIndex

			const isPartiallySelected =
				(validatedStart > segment.startIndex && validatedStart < segment.endIndex) ||
				(validatedEnd > segment.startIndex && validatedEnd < segment.endIndex) ||
				(validatedStart < segment.startIndex &&
					validatedEnd > segment.startIndex &&
					validatedEnd < segment.endIndex)

			if (isCompletelySelected && deleteCompleteVariables) {
				deletedVariables.push(segment)
			} else if (isPartiallySelected) {
				partiallyDeletedVariables.push(segment)

				if (deleteCompleteVariables) {
					// Delete the entire variable instead of partial deletion
					validatedStart = Math.min(validatedStart, segment.startIndex)
					validatedEnd = Math.max(validatedEnd, segment.endIndex)
					deletedVariables.push(segment)
					warnings.push(`Expanded deletion to include complete variable: ${segment.variableName}`)
				} else {
					warnings.push(`Partial deletion of variable prevented: ${segment.variableName}`)
					// Skip this deletion
					return {
						newText: text,
						newCursorPosition: selectionStart,
						deletedVariables: [],
						partiallyDeletedVariables: [segment],
						warnings: [...warnings, "Deletion cancelled to preserve variable integrity"],
					}
				}
			}
		}
	}

	// Perform the deletion
	const newText = text.slice(0, validatedStart) + text.slice(validatedEnd)
	const newCursorPosition = validatedStart

	return {
		newText,
		newCursorPosition,
		deletedVariables,
		partiallyDeletedVariables,
		warnings,
	}
}
