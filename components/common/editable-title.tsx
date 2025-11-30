import React, { useCallback, useState } from "react"
import { Input } from "@/components/ui/plain-input"
import { cn } from "@/lib/utils"
import { useDebouncer } from "@/hooks/use-debouncer"
import { DEBOUNCE_TIME } from "@/constants/common"

interface EditableTitleProps extends React.HTMLAttributes<HTMLDivElement> {
	value: string
	onSave: (value: string) => void
}

export function EditableTitle({ className, value, onSave, ...props }: EditableTitleProps) {
	const [isEditing, setIsEditing] = useState(false)

	const [text, setText] = useState(value)

	const debouncedOnSave = useDebouncer(onSave, DEBOUNCE_TIME)

	const handleTextChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setText(e.target.value)
			debouncedOnSave(e.target.value)
		},
		[debouncedOnSave, setText]
	)

	const handleBlur = useCallback(() => {
		setIsEditing(false)
	}, [])

	const handleClick = useCallback(() => {
		setIsEditing(true)
	}, [])

	return (
		<div
			onClick={handleClick}
			className={cn(
				"h-6 flex items-center font-semibold rounded-sm w-fit min-w-8 cursor-pointer",
				className
			)}
		>
			{isEditing ? (
				<Input
					value={text}
					onChange={handleTextChange}
					onBlur={handleBlur}
					autoFocus
					className="!text-[1em] !h-full w-full focus-visible:ring-0 focus-visible:shadow-none rounded-none border-0 focus-visible:border-0 px-1  -mt-0.5"
					{...props}
				/>
			) : (
				<div className="px-1 h-full flex items-center truncate">{text}</div>
			)}
		</div>
	)
}
