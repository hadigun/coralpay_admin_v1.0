/**
 * Performance optimization utilities for SmartInput component
 * Handles large datasets, debouncing, and memory management
 */

import { useCallback, useRef, useEffect, useMemo, useState } from "react"
import { SuggestionItem, TextSegment } from "@/types/smart-input"
import { debounce } from "./debounce"

/**
 * Configuration for performance optimizations
 */
export interface PerformanceConfig {
	/** Maximum number of suggestions to display */
	maxSuggestions: number
	/** Debounce delay for text parsing (ms) */
	parseDebounceDelay: number
	/** Debounce delay for suggestion filtering (ms) */
	filterDebounceDelay: number
	/** Enable virtual scrolling for large suggestion lists */
	enableVirtualScrolling: boolean
	/** Threshold for enabling virtual scrolling */
	virtualScrollingThreshold: number
}

/**
 * Default performance configuration
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
	maxSuggestions: 50,
	parseDebounceDelay: 150,
	filterDebounceDelay: 100,
	enableVirtualScrolling: true,
	virtualScrollingThreshold: 100,
}

/**
 * Hook for optimizing suggestion filtering with large datasets
 */
export const useOptimizedSuggestionFiltering = (
	variables: Record<string, string>,
	config: Partial<PerformanceConfig> = {}
) => {
	const fullConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...config }
	const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Memoize suggestion items to prevent recreation on every render
	const suggestionItems = useMemo(() => {
		return Object.entries(variables).map(([key, value]) => ({
			key,
			value,
		}))
	}, [variables])

	// Debounced filter function
	const debouncedFilter = useCallback(
		debounce((query: string, callback: (results: SuggestionItem[]) => void) => {
			const filtered = suggestionItems.filter((item) =>
				item.key.toLowerCase().includes(query.toLowerCase())
			)

			// Limit results for performance
			const limited = filtered.slice(0, fullConfig.maxSuggestions)
			callback(limited)
		}, fullConfig.filterDebounceDelay),
		[suggestionItems, fullConfig.maxSuggestions, fullConfig.filterDebounceDelay]
	)

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (filterTimeoutRef.current) {
				clearTimeout(filterTimeoutRef.current)
			}
		}
	}, [])

	return {
		suggestionItems,
		debouncedFilter,
		shouldUseVirtualScrolling:
			suggestionItems.length > fullConfig.virtualScrollingThreshold &&
			fullConfig.enableVirtualScrolling,
	}
}

/**
 * Hook for optimizing text parsing with debouncing
 */
export const useOptimizedTextParsing = (
	parseFunction: (text: string, variables: Record<string, string>) => TextSegment[],
	config: Partial<PerformanceConfig> = {}
) => {
	const fullConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...config }
	const parseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const cacheRef = useRef<Map<string, TextSegment[]>>(new Map())

	// Debounced parse function with caching
	const debouncedParse = useCallback(
		debounce(
			(
				text: string,
				variables: Record<string, string>,
				callback: (segments: TextSegment[]) => void
			) => {
				// Create cache key
				const cacheKey = `${text}:${JSON.stringify(variables)}`

				// Check cache first
				if (cacheRef.current.has(cacheKey)) {
					callback(cacheRef.current.get(cacheKey)!)
					return
				}

				// Parse and cache result
				const segments = parseFunction(text, variables)
				cacheRef.current.set(cacheKey, segments)

				// Limit cache size to prevent memory leaks
				if (cacheRef.current.size > 100) {
					const firstKey = cacheRef.current.keys().next().value
					if (firstKey) {
						cacheRef.current.delete(firstKey)
					}
				}

				callback(segments)
			},
			fullConfig.parseDebounceDelay
		),
		[parseFunction, fullConfig.parseDebounceDelay]
	)

	// Clear cache when variables change significantly
	const clearCache = useCallback(() => {
		cacheRef.current.clear()
	}, [])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (parseTimeoutRef.current) {
				clearTimeout(parseTimeoutRef.current)
			}
			cacheRef.current.clear()
		}
	}, [])

	return {
		debouncedParse,
		clearCache,
	}
}

/**
 * Hook for managing event listener cleanup
 */
export const useEventListenerCleanup = () => {
	const cleanupFunctionsRef = useRef<(() => void)[]>([])

	const addCleanupFunction = useCallback((cleanup: () => void) => {
		cleanupFunctionsRef.current.push(cleanup)
	}, [])

	const removeCleanupFunction = useCallback((cleanup: () => void) => {
		const index = cleanupFunctionsRef.current.indexOf(cleanup)
		if (index > -1) {
			cleanupFunctionsRef.current.splice(index, 1)
		}
	}, [])

	// Cleanup all registered functions on unmount
	useEffect(() => {
		return () => {
			cleanupFunctionsRef.current.forEach((cleanup) => {
				try {
					cleanup()
				} catch (error) {
					console.warn("Error during cleanup:", error)
				}
			})
			cleanupFunctionsRef.current = []
		}
	}, [])

	return {
		addCleanupFunction,
		removeCleanupFunction,
	}
}

/**
 * Utility for throttling rapid state updates
 */
export const useThrottledState = <T>(
	initialValue: T,
	throttleDelay: number = 100
): [T, (value: T) => void, T] => {
	const [state, setState] = useState(initialValue)
	const [throttledState, setThrottledState] = useState(initialValue)
	const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const setThrottledValue = useCallback(
		(value: T) => {
			setState(value)

			if (throttleTimeoutRef.current) {
				clearTimeout(throttleTimeoutRef.current)
			}

			throttleTimeoutRef.current = setTimeout(() => {
				setThrottledState(value)
				throttleTimeoutRef.current = null
			}, throttleDelay)
		},
		[throttleDelay]
	)

	useEffect(() => {
		return () => {
			if (throttleTimeoutRef.current) {
				clearTimeout(throttleTimeoutRef.current)
			}
		}
	}, [])

	return [state, setThrottledValue, throttledState]
}

/**
 * Memory usage monitoring for development
 */
export const useMemoryMonitoring = (componentName: string, enabled: boolean = false) => {
	const renderCountRef = useRef(0)
	const lastMemoryUsageRef = useRef<number>(0)

	useEffect(() => {
		if (!enabled || typeof window === "undefined" || !("performance" in window)) {
			return
		}

		renderCountRef.current++

		// Check memory usage periodically
		const checkMemory = () => {
			if ("memory" in (performance as any)) {
				const memoryInfo = (performance as any).memory
				const currentUsage = memoryInfo.usedJSHeapSize

				if (currentUsage > lastMemoryUsageRef.current * 1.5) {
					console.warn(
						`${componentName}: Potential memory leak detected. ` +
							`Usage increased from ${lastMemoryUsageRef.current} to ${currentUsage} bytes. ` +
							`Render count: ${renderCountRef.current}`
					)
				}

				lastMemoryUsageRef.current = currentUsage
			}
		}

		const timeoutId = setTimeout(checkMemory, 1000)

		return () => {
			clearTimeout(timeoutId)
		}
	})

	return {
		renderCount: renderCountRef.current,
	}
}
