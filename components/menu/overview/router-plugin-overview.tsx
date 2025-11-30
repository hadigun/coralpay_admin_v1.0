import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EDGE_DEFAULT_OPTIONS, HANDLE_DEFAULT_STYLES } from "@/constants/tools"
import { useMenuBuilderStore } from "@/hooks/use-menu-builder-store"
import { getId } from "@/lib/utils"
import type { EdgeData, RouterPlugin } from "@/types"
import type { Route } from "@mobiresoft-coral/ussd-shared-core"
import { Handle, Position, type Edge } from "@xyflow/react"
import { RouterPluginSettings } from "../settings/router-plugin-settings"
import { useCallback } from "react"

interface RouteItemProps extends React.HTMLAttributes<HTMLDivElement> {
	route: Route
	updateRoute: (route: Route) => void
	addEdge: (edge: Edge<EdgeData>) => void
	deleteEdge: (edgeId: string) => void
}

function RouteItem({ route, updateRoute, addEdge, deleteEdge, ...props }: RouteItemProps) {
	return (
		<div
			{...props}
			key={route.id}
			className="relative items-center flex gap-2 border rounded-md w-full p-2 text-xs"
		>
			IF
			<Badge key={route.id + "input"} className="text-[0.6rem] bg-purple-400 truncate flex-1">
				{route.input || "Not set"}
			</Badge>
			matches
			<Badge key={route.id + "condition"} className="text-[0.6rem] truncate flex-1">
				{route.condition || "Not set"}
			</Badge>
			<Handle
			key={route.id + "handle"}
				onPointerDown={(e) => e.stopPropagation()}
				onConnect={(connection) => {
					if (route.edgeId) {
						deleteEdge(route.edgeId)
					}

					const edgeId = getId()

					addEdge({
						id: edgeId,
						source: connection.source!,
						target: connection.target!,
						sourceHandle: connection.sourceHandle,
						targetHandle: connection.targetHandle,
						...EDGE_DEFAULT_OPTIONS,
					})

					updateRoute({
						...route,
						targetMenuId: connection.target!,
						edgeId: edgeId,
					})
				}}
				type="source"
				position={Position.Right}
				style={{ right: -26, ...HANDLE_DEFAULT_STYLES }}
				id={`${route.id}`}
			/>
		</div>
	)
}

interface RouterPluginOverviewProps {
	plugin: RouterPlugin
	onPluginSave: (pluginId: string, plugin: RouterPlugin) => void
}

export function RouterPluginOverview({ plugin, onPluginSave }: RouterPluginOverviewProps) {
	const { routes } = plugin.config

	const store = useMenuBuilderStore()

	const addEdge = store((s) => s.addEdge)
	const deleteEdge = store((s) => s.deleteEdge)

	function onAddRoute() {
		onPluginSave(plugin.id, {
			...plugin,
			config: {
				...plugin.config,
				routes: [
					...routes,
					{
						id: getId(),
						input: "",
						condition: "",
						targetMenuId: "",
						edgeId: "",
					},
				],
			},
		})
	}

	const onRouteSave = useCallback(
		(id: string, updatedRoute: Route) => {
			onPluginSave(plugin.id, {
				...plugin,
				config: {
					...plugin.config,
					routes: routes.map((r) => (r.id === id ? updatedRoute : r)),
				},
			})
		},
		[plugin, routes, onPluginSave]
	)

	return (
		<div className="flex flex-col gap-y-1 items-center">
			{routes.map((route) => (
				<Popover key={route.id}>
					<PopoverTrigger asChild>
						<RouteItem
							route={route}
							updateRoute={(updatedRoute) => {
								onPluginSave(plugin.id, {
									...plugin,
									config: {
										...plugin.config,
										routes: routes.map((r) => (r.id === updatedRoute.id ? updatedRoute : r)),
									},
								})
							}}
							addEdge={addEdge}
							deleteEdge={deleteEdge}
						/>
					</PopoverTrigger>
					<PopoverContent side="left">
						<RouterPluginSettings route={route} onSave={onRouteSave} />
					</PopoverContent>
				</Popover>
			))}

			<Button
				onClick={onAddRoute}
				className="w-full cursor-pointer text-xs h-auto p-1"
				variant="outline"
			>
				Add Route
			</Button>
		</div>
	)
}
