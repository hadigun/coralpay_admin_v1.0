import { useCallback, useEffect, useRef } from "react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncer<T extends (...args: any[]) => any>(
	effect: T,
	delay: number
): (...args: Parameters<T>) => void {
	const timeoutId = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		// return () => {
		// 	if (timeoutId.current) {
		// 		clearTimeout(timeoutId.current)
		// 		timeoutId.current = null
		// 	}
		// }
	}, [])

	const debouncedEffect = useCallback(
		(...args: Parameters<T>) => {
			if (timeoutId.current) {
				clearTimeout(timeoutId.current)
			}
			timeoutId.current = setTimeout(() => {
				effect(...args)
				timeoutId.current = null
			}, delay)
		},
		[effect, delay]
	)

	return debouncedEffect
}
