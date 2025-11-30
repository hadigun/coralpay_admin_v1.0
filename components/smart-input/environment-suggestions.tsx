/**
 * EnvironmentSuggestions component for displaying environment variable suggestions
 * Uses shadcn Popover for consistent styling and positioning
 * Includes comprehensive accessibility features for screen readers and keyboard navigation
 */

"use client"

import React, { useEffect, useRef, useId } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EnvironmentSuggestionsExtendedProps } from "@/types/smart-input"
import { cn } from "@/lib/utils"

export const EnvironmentSuggestions: React.FC<EnvironmentSuggestionsExtendedProps> = ({
	isOpen,
	suggestions,
	selectedIndex,
	onSelect,
	onClose,
	onHover,
	emptyMessage = "No matching variables",
	noVariablesMessage = "No variables available",
	inputId,
	children,
}) => {
	// Generate unique IDs for accessibility
	const listboxId = useId()
	const statusId = useId()
	const selectedOptionId = useId()

	// Refs for managing focus and announcements
	const listboxRef = useRef<HTMLDivElement>(null)
	const statusRef = useRef<HTMLDivElement>(null)
	const previousAnnouncementRef = useRef<string>("")

	// Determine empty state message
	const getEmptyMessage = () => {
		return suggestions.length === 0 ? emptyMessage : noVariablesMessage
	}

	// Generate status message for screen readers
	const getStatusMessage = () => {
		if (suggestions.length === 0) {
			return getEmptyMessage()
		}

		const selectedSuggestion = suggestions[selectedIndex]
		const position = `${selectedIndex + 1} of ${suggestions.length}`

		if (selectedSuggestion) {
			return `${selectedSuggestion.key}, ${position}. ${selectedSuggestion.value}`
		}

		return `${suggestions.length} suggestions available`
	}

	// Announce changes to screen readers
	useEffect(() => {
		if (isOpen && statusRef.current) {
			const currentMessage = getStatusMessage()

			// Only announce if the message has changed
			if (currentMessage !== previousAnnouncementRef.current) {
				previousAnnouncementRef.current = currentMessage

				// Use a small delay to ensure the announcement is made
				setTimeout(() => {
					if (statusRef.current) {
						statusRef.current.textContent = currentMessage
					}
				}, 100)
			}
		}
	}, [isOpen, suggestions, selectedIndex])

	// Scroll selected item into view
	useEffect(() => {
		if (isOpen && suggestions.length > 0 && listboxRef.current) {
			const selectedElement = listboxRef.current.querySelector(
				`[data-index="${selectedIndex}"]`
			) as HTMLElement

			if (selectedElement) {
				selectedElement.scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				})
			}
		}
	}, [isOpen, selectedIndex, suggestions.length])

	// Announce when suggestions open/close
	useEffect(() => {
		if (statusRef.current) {
			if (isOpen) {
				const openMessage =
					suggestions.length > 0
						? `Environment variable suggestions opened. ${suggestions.length} suggestions available.`
						: `Environment variable suggestions opened. ${getEmptyMessage()}`

				statusRef.current.textContent = openMessage
			} else {
				statusRef.current.textContent = "Environment variable suggestions closed."
			}
		}
	}, [isOpen])

	return (
		<>
			<Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
				<PopoverTrigger asChild>{children}</PopoverTrigger>
				<PopoverContent
					className="w-80 p-0 shadow-lg border"
					align="start"
					side="bottom"
					sideOffset={4}
					onOpenAutoFocus={(e) => e.preventDefault()}
					role="presentation"
				>
					<div
						ref={listboxRef}
						className="max-h-60 overflow-y-auto"
						role="listbox"
						id={listboxId}
						aria-label="Environment variable suggestions"
						aria-activedescendant={
							suggestions.length > 0 && selectedIndex >= 0
								? `${selectedOptionId}-${selectedIndex}`
								: undefined
						}
					>
						{suggestions.length === 0 ? (
							<div
								className="p-3 text-sm text-muted-foreground text-center"
								role="status"
								aria-live="polite"
							>
								{getEmptyMessage()}
							</div>
						) : (
							<div className="py-1">
								{suggestions.map((suggestion, index) => (
									<div
										key={suggestion.key}
										id={`${selectedOptionId}-${index}`}
										data-index={index}
										className={cn(
											"px-3 py-2 cursor-pointer text-sm transition-colors",
											"hover:bg-accent hover:text-accent-foreground",
											"focus:bg-accent focus:text-accent-foreground",
											"border-l-2 border-transparent",
											index === selectedIndex && [
												"bg-accent text-accent-foreground",
												"border-l-primary",
											]
										)}
										onClick={() => onSelect(suggestion)}
										onMouseEnter={() => onHover?.(index)}
										role="option"
										aria-selected={index === selectedIndex}
										aria-describedby={`${selectedOptionId}-${index}-desc`}
									>
										<div className="font-medium text-foreground">{suggestion.key}</div>
										<div
											id={`${selectedOptionId}-${index}-desc`}
											className="text-xs text-muted-foreground truncate mt-0.5"
										>
											{suggestion.value}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</PopoverContent>
			</Popover>

			{/* Screen reader status announcements */}
			<div
				ref={statusRef}
				id={statusId}
				className="sr-only"
				role="status"
				aria-live="assertive"
				aria-atomic="true"
			/>
		</>
	)
}
