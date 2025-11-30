import { useCallback } from "react"
import { TOOL_TYPE_TO_PLUGIN } from "@/constants/tools"
import { isPluginOrInputTool } from "@/lib/plugin-utils"
import type { Plugin } from "@/types"
import { useMenuBuilderStore } from "@/hooks/use-menu-builder-store"
import { APP_HANDLE } from "@/constants/common"
import { toast } from "sonner"
import { useNodeId } from "@xyflow/react"
import { MenuServiceChangeType } from "@mobiresoft-coral/ussd-shared-core"

export function useNodeAction() {
	const id = useNodeId()!
	const store = useMenuBuilderStore()
	const updateNode = store((state) => state.updateNodeData)
	const updateFullNode = store((state) => state.updateNode)
	const removeNodeAction = store((state) => state.removeNode)
	const removePluginAction = store((state) => state.removePlugin)
	const openEmulator = store((state) => state.openSimulator)
	const addPrePlugin = store((state) => state.addPrePlugin)
	const addPostPlugin = store((state) => state.addPostPlugin)
	const updatePrePlugin = store((s) => s.updatePrePlugin)
	const updatePostPlugin = store((s) => s.updatePostPlugin)
	const updateNodeMetaInner = store((s) => s.updateNodeMeta)

	const updateNodeMeta = useCallback(
		(
			...args: Parameters<typeof updateNodeMetaInner> extends [infer _, ...infer Rest]
				? [...Rest]
				: never
		) => {
			updateNodeMetaInner(id, ...args)
		},
		[id, updateNode]
	)

	const removePrePlugin = useCallback(
		(pluginId: string) => {
			removePluginAction(id, pluginId, false)
		},
		[id, removePluginAction]
	)

	const toggleDragging = useCallback(
		(draggable: boolean) => {
			updateFullNode(id, { draggable })
		},
		[id, updateFullNode]
	)

	const removePostPlugin = useCallback(
		(pluginId: string) => {
			removePluginAction(id, pluginId, true)
		},
		[id, removePluginAction]
	)

	const removeNode = useCallback(() => {
		removeNodeAction(id)
	}, [id, removeNodeAction])

	const addPlugin = useCallback(
		(nodeId: string, plugin: Plugin, isPostPlugin: boolean = true) => {
			if (isPostPlugin) {
				addPostPlugin(nodeId, plugin)
			} else {
				addPrePlugin(nodeId, plugin)
			}
		},
		[addPostPlugin, addPrePlugin]
	)

	const onDropPostPlugin = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault()
			event.stopPropagation()

			const toolType = event.dataTransfer.getData("application/reactflow")

			if (!toolType) {
				return
			}

			if (!isPluginOrInputTool(toolType)) {
				return
			}

			const createPlugin = TOOL_TYPE_TO_PLUGIN[toolType]

			if (!createPlugin) {
				return
			}

			addPlugin(id, createPlugin())
		},
		[id, addPlugin]
	)

	const onDropPrePlugin = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault()
			event.stopPropagation()
			const toolType = event.dataTransfer.getData("application/reactflow")
			if (!toolType) {
				return
			}
			if (!isPluginOrInputTool(toolType)) {
				return
			}
			const createPlugin = TOOL_TYPE_TO_PLUGIN[toolType]
			if (!createPlugin) {
				return
			}
			addPlugin(id, createPlugin(), false)
		},
		[id, addPlugin]
	)

	const updateNodeData = useCallback(
		(...args: [Parameters<typeof updateNode>[1]]) => {
			updateNode(id, ...args)
		},
		[id, updateNode]
	)

	const updatePlugin = useCallback(
		(pluginId: string, plugin: Plugin, isPostPlugin: boolean = true) => {
			if (isPostPlugin) {
				updatePostPlugin(id, pluginId, plugin)
			} else {
				updatePrePlugin(id, pluginId, plugin)
			}
		},
		[id, updatePrePlugin, updatePostPlugin]
	)

	const onCopyAction = useCallback(async () => {
		const node = store.getState().nodes.find((n) => n.id === id)

		if (!node) {
			return
		}

		const data = {
			type: APP_HANDLE,
			payload: {
				id: node.id,
				type: node.type,
				position: node.position,
				data: node.data,
			},
		}

		if (navigator.clipboard) {
			await navigator.clipboard.writeText(JSON.stringify(data))

			toast.success("Node copied to clipboard")
		}
	}, [id, store])

	const onIdCopyAction = useCallback(async () => {
		if (navigator.clipboard) {
			await navigator.clipboard.writeText(id)

			toast.success("Node ID copied to clipboard")
		}
	}, [id])

	const reorderPlugins = useCallback(
		(plugins: Plugin[], isPostPlugin: boolean) => {
			updateNode(id, { [isPostPlugin ? "postPlugins" : "prePlugins"]: plugins })
		},
		[id, updateNode]
	)

	const startEmulation = useCallback(() => {
		openEmulator({ startNodeId: id })
	}, [id, openEmulator])

	return {
		startEmulation,
		onDropPrePlugin,
		onDropPostPlugin,
		updateNodeData,
		updatePlugin,
		removeNode,
		removePrePlugin,
		removePostPlugin,
		onCopyAction,
		onIdCopyAction,
		reorderPlugins,
		toggleDragging,
		updateNodeMeta,
	}
}
