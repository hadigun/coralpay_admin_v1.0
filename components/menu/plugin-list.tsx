import { DndContext, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Plugin } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import {
	MenuComponentBody,
	MenuComponentIcon,
	MenuComponentOverview,
} from "@/components/menu/component-overview"
import { PluginView } from "@/components/menu/plugin-view"
import { ICON_MAP } from "@/constants/tools"
import { cn, determineToolColor } from "@/lib/utils"
import { ApiCallPluginSettings } from "@/components/menu/settings/apicall-plugin-settings"
import { PaymentPluginSettings } from "@/components/menu/settings/payment-plugin-settings"
import { ValidationPluginSettings } from "@/components/menu/settings/validation-plugin-settings"
import { useEffect } from "react"
import { useNodeAction } from "@/hooks/use-node-action"
import { useReactFlow } from "@xyflow/react"

interface PluginListProps {
	plugins: Plugin[]
	onPluginSave: (id: string, plugin: Plugin) => void
	onPluginRemove: (id: string) => void
	onPluginReorder: (plugins: Plugin[]) => void
}

interface SortablePluginItemProps extends React.HTMLAttributes<HTMLDivElement> {
	plugin: Plugin
	onPluginSave: (id: string, plugin: Plugin) => void
	onPluginRemove: (id: string) => void
}

function SortablePluginItemInner({
	plugin,
	onPluginSave,
	onPluginRemove,
	...props
}: SortablePluginItemProps) {
	// const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
	// 	id: plugin.id,
	// })
	const { attributes, setNodeRef, transform, transition, isDragging } = useSortable({
		id: plugin.id,
	})
	const Icon = ICON_MAP[plugin.toolType]

	const { toggleDragging } = useNodeAction()

	useEffect(() => {
		if (isDragging) {
			toggleDragging(false)
		} else {
			toggleDragging(true)
		}
	}, [toggleDragging, isDragging])

	const { getZoom } = useReactFlow()

	const zoom = getZoom()

	const transformWithoutScale = {
		x: (transform?.x ?? 0) / zoom,
		y: (transform?.y ?? 0) / zoom,
		scaleX: 1,
		scaleY: 1,
	}

	return (
		<div {...props}>
			<div
				ref={setNodeRef}
				style={{
					transform: CSS.Transform.toString(transformWithoutScale),
					transition,
					zIndex: isDragging ? 100 : undefined,
				}}
				// {...listeners}
				className={cn("cursor-grab group relative flex items-center", isDragging && "nopan")}
				{...attributes}
			>
				<MenuComponentOverview className="border border-[#F9F9F9] flex-1 flex-shrink-0 bg-white">
					<MenuComponentIcon>
						<Icon className={cn("h-3 w-3", determineToolColor(plugin.toolType))} />
					</MenuComponentIcon>
					<MenuComponentBody>
						<PluginView plugin={plugin} onPluginSave={onPluginSave} />
					</MenuComponentBody>
				</MenuComponentOverview>
				<Button
					variant="ghost"
					size="sm"
					className="cursor-pointer h-full w-5 p-1 hover:bg-black/10 bg-black/10 absolute top-0 right-0 rounded-l-none invisible group-hover:visible"
					onClick={() => onPluginRemove(plugin.id)}
				>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			</div>
		</div>
	)
}

function SortablePluginItem({
	plugin,
	onPluginSave,
	onPluginRemove,
}: {
	plugin: Plugin
	onPluginSave: (id: string, plugin: Plugin) => void
	onPluginRemove: (id: string) => void
}) {
	if (plugin.type === "router") {
		return (
			<SortablePluginItemInner
				plugin={plugin}
				onPluginSave={onPluginSave}
				onPluginRemove={onPluginRemove}
			/>
		)
	}
	return (
		<Popover>
			<PopoverTrigger asChild>
				<SortablePluginItemInner
					plugin={plugin}
					onPluginSave={onPluginSave}
					onPluginRemove={onPluginRemove}
				/>
			</PopoverTrigger>
			<PopoverContent
				side="left"
				className="rounded-lg border-none shadow-md p-4 min-w-80 max-h-[30rem] overflow-y-auto"
			>
				{(() => {
					switch (plugin.type) {
						case "api_call":
							return <ApiCallPluginSettings plugin={plugin} onSave={onPluginSave} />
						case "payment":
							return <PaymentPluginSettings plugin={plugin} onSave={onPluginSave} />
						case "validation":
							return <ValidationPluginSettings plugin={plugin} onSave={onPluginSave} />
					}
				})()}
			</PopoverContent>
		</Popover>
	)
}

export function PluginList({
	plugins,
	onPluginSave,
	onPluginRemove,
	onPluginReorder,
}: PluginListProps) {
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (active.id !== over?.id) {
			const oldIndex = plugins.findIndex((p) => p.id === active.id)
			const newIndex = plugins.findIndex((p) => p.id === over?.id)
			const reorderedPlugins = arrayMove(plugins, oldIndex, newIndex)
			onPluginReorder(reorderedPlugins)
		}
	}

	return (
		<DndContext onDragEnd={handleDragEnd}>
			<SortableContext items={plugins.map((p) => p.id)}>
				<div className="space-y-1.5">
					{plugins.map((plugin) => (
						<SortablePluginItem
							key={plugin.id}
							plugin={plugin}
							onPluginSave={onPluginSave}
							onPluginRemove={onPluginRemove}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	)
}
