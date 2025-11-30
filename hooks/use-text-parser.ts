/**
 * Custom hook for parsing text and identifying environment variable patterns
 * Handles text segmentation and validation of variable references
 */

import { useMemo } from "react"
import { TextSegment } from "@/types/smart-input"
import { parseText } from "@/lib/smart-input-utils"
import { DEBOUNCE_DELAY } from "@/lib/smart-input-constants"
import { debounce } from "@/lib/smart-input-utils"

interface UseTextParserOptions {
	/**
	 * Debounce delay for parsing operations (default: 150ms)
	 */
	debounceDelay?: number
}

interface UseTextParserReturn {
	/**
	 * Array of text segments with type information
	 */
	segments: TextSegment[]

	/**
	 * Check if text contains any environment variables
	 */
	hasVariables: boolean

	/**
	 * Count of valid environment variables
	 */
	validVariableCount: number

	/**
	 * Count of invalid environment variables
	 */
	invalidVariableCount: number

	/**
	 * Get all variable names found in the text
	 */
	variableNames: string[]

	/**
	 * Check if a specific variable exists in the text
	 */
	hasVariable: (variableName: string) => boolean
}

/**
 * Hook for parsing text and identifying environment variable patterns
 *
 * @param text - The input text to parse
 * @param variables - Available environment variables for validation
 * @param options - Configuration options
 * @returns Parsed text segments and utility functions
 */
export const useTextParser = (
	text: string,
	variables: Record<string, string> = {},
	options: UseTextParserOptions = {}
): UseTextParserReturn => {
	const { debounceDelay = DEBOUNCE_DELAY } = options

	// Parse text into segments with memoization for performance
	const segments = useMemo(() => {
		return parseText(text, variables)
	}, [text, variables])

	// Calculate derived values from segments
	const derivedValues = useMemo(() => {
		const variableSegments = segments.filter(
			(segment) => segment.type === "variable" || segment.type === "invalid-variable"
		)

		const validVariables = segments.filter((segment) => segment.type === "variable")
		const invalidVariables = segments.filter((segment) => segment.type === "invalid-variable")

		const variableNames = variableSegments
			.map((segment) => segment.variableName)
			.filter((name): name is string => name !== undefined)

		return {
			hasVariables: variableSegments.length > 0,
			validVariableCount: validVariables.length,
			invalidVariableCount: invalidVariables.length,
			variableNames,
		}
	}, [segments])

	// Function to check if a specific variable exists in the text
	const hasVariable = useMemo(() => {
		return (variableName: string): boolean => {
			return derivedValues.variableNames.includes(variableName)
		}
	}, [derivedValues.variableNames])

	return {
		segments,
		hasVariables: derivedValues.hasVariables,
		validVariableCount: derivedValues.validVariableCount,
		invalidVariableCount: derivedValues.invalidVariableCount,
		variableNames: derivedValues.variableNames,
		hasVariable,
	}
}
