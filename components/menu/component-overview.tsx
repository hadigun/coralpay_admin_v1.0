import React, { useMemo } from "react"
import type { Plugin } from "@/types"
import { cn } from "@/lib/utils"

interface MenuComponentOverviewProps extends React.HTMLAttributes<HTMLDivElement> {
	plugin?: Plugin
}

interface MenuComponentIconProps {
	children?: React.ReactNode
}

export function MenuComponentIcon({ children }: MenuComponentIconProps) {
	return <>{children}</>
}

export interface MenuComponentBodyProps {
	children?: React.ReactNode
}

export function MenuComponentBody({ children }: MenuComponentBodyProps) {
	return <>{children}</>
}

export function MenuComponentOverview({
	className,
	children,
	...props
}: MenuComponentOverviewProps) {
	const [iconElement, bodyElement] = useMemo(() => {
		const childrenArray = React.Children.toArray(children)

		let iconElement: React.ReactNode = null
		let bodyElement: React.ReactNode = null

		childrenArray.forEach((child) => {
			if (React.isValidElement(child)) {
				if (child.type === MenuComponentIcon) {
					iconElement = (child.props as MenuComponentIconProps).children
				} else if (child.type === MenuComponentBody) {
					bodyElement = (child.props as MenuComponentBodyProps).children
				}
			}
		})

		return [iconElement, bodyElement]
	}, [children])

	return (
		<div
			className={cn(
				"cursor-pointer flex items-center gap-x-2 rounded-xl bg-gray-100 text-xs p-2",
				className
			)}
			{...props}
		>
			{iconElement && <div className="flex-shrink-0 self-start">{iconElement}</div>}
			<div className="flex-1">{bodyElement && bodyElement}</div>
		</div>
	)
}
