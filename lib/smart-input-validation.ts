/**
 * Validation utilities for Smart Input component
 * Separated to avoid circular dependencies
 */

/**
 * Validate if a variable name follows valid naming conventions
 */
export const isValidVariableName = (name: string): boolean => {
	// Variable names should start with letter or underscore, followed by letters, numbers, or underscores
	const validNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/
	return validNamePattern.test(name) && name.length > 0
}

/**
 * Generate a unique ID for text segments
 */
export const generateId = (): string => {
	return Math.random().toString(36).substring(2, 11)
}
