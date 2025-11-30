import { create } from "zustand"
import { COMPONENT_CREATION_DEFAULT, NODE_TYPES } from "@/constants/tools"
import {
	type ReactFlowInstance,
	type Node,
	type Edge,
	applyNodeChanges,
	applyEdgeChanges,
	type NodeChange,
	type EdgeChange,
	type NodeProps,
	Connection,
} from "@xyflow/react"
import type { EdgeData, NodeData, NodeType, Plugin, SimulatorConfig, ToolType } from "@/types"

import { getId } from "@/lib/utils"
import { debounce } from "@/lib/debounce"
import { applyServiceChanges } from "@/api/menu"
import {
	createApiPlugin,
	createNodeData,
	createNumberInputPlugin,
	createPaymentPlugin,
	createRouterPlugin,
} from "@/lib/plugin-utils"
import { APP_HANDLE } from "@/constants/common"
import {
	MenuNodeType,
	MenuServiceChangeType,
	type MenuServiceChange,
} from "@mobiresoft-coral/ussd-shared-core"
import { toast } from "sonner"

const DEFAULT_NODE: Node<NodeData, NodeType>[] = [
	{
		id: getId(),
		position: { x: 500, y: 250 },
		type: MenuNodeType.Menu,
		data: createNodeData({
			renderTemplate: `\Welcom to the menu!\n\t1. Option 1\n`,
			name: "Menu #1",
			type: MenuNodeType.Menu,
			postPlugins: [
				createNumberInputPlugin(),
				createRouterPlugin(),
				createPaymentPlugin(),
				createApiPlugin(),
			],
		}),
	},
]

type MenuBuilderState = {
	reactFlowInstance: ReactFlowInstance<Node<NodeData>, Edge<EdgeData>> | null
	nodes: Node<NodeData>[]
	edges: Edge<EdgeData>[]
	nodeTypes: Record<NodeType, React.ComponentType<NodeProps<Node<NodeData>>>>
	simulatorConfig: SimulatorConfig
	changes: MenuServiceChange[]
	isSaving: boolean
	saveError: string | null
	retryCount: number
	merchantId?: string
	serviceId?: string
	serviceEnvs: Record<string, string>
}

type MenuBuilderActions = {
	setReactFlowInstance: (instance: ReactFlowInstance<Node<NodeData>, Edge<EdgeData>> | null) => void
	closeSimulator: () => void
	openSimulator: (options: Partial<SimulatorConfig>) => void
	initializeSimulatorFromUrl: () => void
	setNodes: (nodes: Node<NodeData>[]) => void
	setEdges: (edges: Edge<EdgeData>[]) => void
	onNodesChange: (changes: NodeChange<Node<NodeData>>[]) => void
	onEdgesChange: (changes: EdgeChange[]) => void
	addEdge: (edge: Edge<EdgeData>) => void
	deleteEdge: (edgeId: string) => void
	onDrop: (event: React.DragEvent) => void
	onDragOver: (event: React.DragEvent) => void
	updateNodeData: (
		nodeId: string,
		dispatch: Partial<NodeData> | ((node: Node<NodeData>) => Partial<NodeData>)
	) => void
	removePlugin: (nodeId: string, pluginId: string, isPostPlugin?: boolean) => void
	removeNode: (nodeId: string) => void
	addNode(node: Node<NodeData>): void
	updateNode(
		nodeId: string,
		dispatch: Partial<Node<NodeData>> | ((node: Node<NodeData>) => Partial<Node<NodeData>>)
	): void
	onPaste: (event: React.ClipboardEvent) => Promise<void>
	addChange: (change: MenuServiceChange) => void
	clearChanges: () => void
	save: () => void
	retrySave: () => void
	clearSaveError: () => void
	setMerchantAndService: (merchantId: string, serviceId: string) => void
	updateServiceMeta: (name?: string, envs?: Record<string, any>) => void
	updateNodeMeta: (
		nodeId: string,
		meta: {
			name?: string
			directRoute?: {
				edgeId: string
				targetMenuId: string
			}
			renderTemplate?: string
			meta?: Record<string, any>
		}
	) => void
	addPrePlugin: (nodeId: string, plugin: Plugin) => void
	updatePrePlugin: (nodeId: string, pluginId: string, plugin: Partial<Plugin>) => void
	reorderPrePlugins: (nodeId: string, pluginIds: string[]) => void
	removePrePlugin: (nodeId: string, pluginId: string) => void
	addPostPlugin: (nodeId: string, plugin: Plugin) => void
	updatePostPlugin: (nodeId: string, pluginId: string, plugin: Partial<Plugin>) => void
	reorderPostPlugins: (nodeId: string, pluginIds: string[]) => void
	removePostPlugin: (nodeId: string, pluginId: string) => void
	updateEnvironmentVariables: (envs: Record<string, string>) => void
	getEnvironmentVariables: () => Record<string, string>
	setEnvironmentVariables: (envs: Record<string, string>) => void
	// addConnection: (nodeId: string, edgeId: string, connection: Connection) => void
}

export const menuBuilderStore = create<MenuBuilderState & MenuBuilderActions>((set, get) => ({
	reactFlowInstance: null,
	// nodes: JSON.parse(JSON.stringify(DEFAULT_NODE)),
	nodes: [],
	edges: [],
	nodeTypes: NODE_TYPES,
	simulatorConfig: {
		open: false,
	},
	changes: [],
	isSaving: false,
	saveError: null,
	retryCount: 0,
	serviceEnvs: {},
	setMerchantAndService: (merchantId, serviceId) => set({ merchantId, serviceId }),
	updateServiceMeta: (name, envs) => {
		get().addChange({ changeType: MenuServiceChangeType.MetaChange, name, envs })
	},
	updateNodeMeta: (nodeId, meta) => {
		const { addChange, nodes } = get()

		const node = nodes.find((n) => n.id === nodeId)

		set((state) => ({
			nodes: state.nodes.map((node) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								...meta,
							},
					  }
					: node
			),
		}))

		addChange({
			changeType: MenuServiceChangeType.NodeMetaChange,
			nodeId,
			...meta,
			meta: { ...node?.data.meta, ...meta.meta },
		})
	},
	addPrePlugin: (nodeId: string, plugin: Plugin) => {
		set((state: any) => ({
			nodes: state.nodes.map((node: Node<NodeData>) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								prePlugins: [...(node.data.prePlugins || []), plugin],
							},
					  }
					: node
			),
		}))
		get().addChange({
			changeType: MenuServiceChangeType.PrePluginAdd,
			nodeId,
			plugin: plugin as any,
		})
	},
	updatePrePlugin: (nodeId: string, pluginId: string, plugin: Partial<Plugin>) => {
		set((state: any) => ({
			nodes: state.nodes.map((node: Node<NodeData>) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								prePlugins: node.data.prePlugins?.map((p: Plugin) =>
									p.id === pluginId ? { ...p, ...plugin } : p
								),
							},
					  }
					: node
			),
		}))
		get().addChange({
			changeType: MenuServiceChangeType.PrePluginChange,
			nodeId,
			pluginId,
			plugin: plugin as any,
		})
	},

	reorderPrePlugins: (nodeId: string, pluginIds: string[]) => {
		set((state: any) => ({
			nodes: state.nodes.map((node: Node<NodeData>) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								prePlugins: pluginIds
									.map((id) => node.data.prePlugins?.find((p: Plugin) => p.id === id))
									.filter(Boolean) as Plugin[],
							},
					  }
					: node
			),
		}))
		get().addChange({ changeType: MenuServiceChangeType.PrePluginReorder, nodeId, pluginIds })
	},

	removePrePlugin: (nodeId: string, pluginId: string) => {
		set((state: any) => ({
			nodes: state.nodes.map((node: Node<NodeData>) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								prePlugins: node.data.prePlugins?.filter((p: Plugin) => p.id !== pluginId),
							},
					  }
					: node
			),
		}))
		get().addChange({ changeType: MenuServiceChangeType.PrePluginRemove, nodeId, pluginId })
	},

	addPostPlugin: (nodeId: string, plugin: Plugin) => {
		set((state: any) => ({
			nodes: state.nodes.map((node: Node<NodeData>) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								postPlugins: [...(node.data.postPlugins || []), plugin],
							},
					  }
					: node
			),
		}))
		get().addChange({
			changeType: MenuServiceChangeType.PostPluginAdd,
			nodeId,
			plugin: plugin as any,
		})
	},

	updatePostPlugin: (nodeId: string, pluginId: string, plugin: Partial<Plugin>) => {
		set((state: any) => ({
			nodes: state.nodes.map((node: Node<NodeData>) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								postPlugins: node.data.postPlugins?.map((p: Plugin) =>
									p.id === pluginId ? { ...p, ...plugin } : p
								),
							},
					  }
					: node
			),
		}))

		get().addChange({
			changeType: MenuServiceChangeType.PostPluginChange,
			nodeId,
			pluginId,
			plugin: plugin as any,
		})
	},

	reorderPostPlugins: (nodeId: string, pluginIds: string[]) => {
		set((state: any) => ({
			nodes: state.nodes.map((node: Node<NodeData>) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								postPlugins: pluginIds
									.map((id) => node.data.postPlugins?.find((p: Plugin) => p.id === id))
									.filter(Boolean) as Plugin[],
							},
					  }
					: node
			),
		}))
		get().addChange({ changeType: MenuServiceChangeType.PostPluginReorder, nodeId, pluginIds })
	},

	removePostPlugin: (nodeId: string, pluginId: string) => {
		set((state: any) => ({
			nodes: state.nodes.map((node: Node<NodeData>) =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								postPlugins: node.data.postPlugins?.filter((p: Plugin) => p.id !== pluginId),
							},
					  }
					: node
			),
		}))
		get().addChange({ changeType: MenuServiceChangeType.PostPluginRemove, nodeId, pluginId })
	},
	addChange: (change) => {
		set((state) => ({ changes: [...state.changes, change] }))
		get().save()
	},
	clearChanges: () => set({ changes: [] }),

	retrySave: () => {
		set({ retryCount: 0, saveError: null })
		get().save()
	},

	clearSaveError: () => {
		set({ saveError: null })
	},

	save: debounce(async () => {
		const { changes, save, merchantId, serviceId, retryCount } = get()

		if (!merchantId || !serviceId) return

		if (get().isSaving || changes.length === 0) return

		set({ isSaving: true, saveError: null })

		const changesToSave = [...changes]

		try {
			await applyServiceChanges(merchantId, serviceId, changesToSave)
			set((state) => ({
				changes: state.changes.slice(changesToSave.length),
				retryCount: 0,
				saveError: null,
			}))

			// Show success toast only if there was a previous error or retry
			if (retryCount > 0) {
				toast.success("Changes saved successfully")
			}
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message || error?.message || "Failed to save changes"

			set({
				saveError: errorMessage,
				retryCount: retryCount + 1,
			})

			// Show error toast with retry option for network errors
			if (retryCount < 3) {
				toast.error("Failed to save changes", {
					description: `${errorMessage}. Will retry automatically...`,
					action: {
						label: "Retry Now",
						onClick: () => get().retrySave(),
					},
				})

				// Auto-retry after a delay (exponential backoff)
				setTimeout(() => {
					if (get().changes.length > 0 && get().retryCount <= 3) {
						save()
					}
				}, Math.min(1000 * Math.pow(2, retryCount), 10000))
			} else {
				// Max retries reached
				toast.error("Unable to save changes", {
					description:
						"Maximum retry attempts reached. Please check your connection and try again.",
					action: {
						label: "Retry",
						onClick: () => get().retrySave(),
					},
				})
			}
		} finally {
			set({ isSaving: false })

			// Continue saving if there are more changes and no critical error
			if (get().changes.length > 0 && get().retryCount < 3) {
				save()
			}
		}
	}, 500),
	closeSimulator: () => {
		set({ simulatorConfig: { open: false } })
		// Clear URL params
		// if (typeof window !== "undefined") {
		// 	const url = new URL(window.location.href)
		// 	url.searchParams.delete("simulatorOpen")
		// 	url.searchParams.delete("simulatorStartNodeId")
		// 	window.history.pushState({}, "", url)
		// }
	},
	openSimulator: (options) => {
		set({ simulatorConfig: { open: true, ...options } })
		// Update URL params
		// if (typeof window !== "undefined") {
		// 	const url = new URL(window.location.href)
		// 	url.searchParams.set("simulatorOpen", "true")
		// 	if (options.startNodeId) {
		// 		url.searchParams.set("simulatorStartNodeId", options.startNodeId)
		// 	} else {
		// 		url.searchParams.delete("simulatorStartNodeId")
		// 	}
		// 	window.history.pushState({}, "", url)
		// }
	},
	initializeSimulatorFromUrl: () => {
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href)
			const simulatorOpen = url.searchParams.get("simulatorOpen") === "true"
			const simulatorStartNodeId = url.searchParams.get("simulatorStartNodeId") || undefined

			if (simulatorOpen) {
				set({
					simulatorConfig: {
						open: true,
						startNodeId: simulatorStartNodeId,
					},
				})
			}
		}
	},
	setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),
	setNodes: (nodes) => {
		set({ nodes })
		localStorage.setItem("menuBuilderNodes", JSON.stringify(nodes))
	},
	setEdges: (edges) => {
		set({ edges })
		localStorage.setItem("menuBuilderEdges", JSON.stringify(edges))
	},

	onNodesChange: (changes) => {
		const { nodes, setNodes } = get()
		const updatedNodes = applyNodeChanges(changes, nodes)
		setNodes(updatedNodes)
	},

	onEdgesChange: (changes) => {
		const { edges, setEdges } = get()
		const updatedEdges = applyEdgeChanges(changes, edges)
		setEdges(updatedEdges)
	},

	onPaste: async (event) => {
		const clipboard = event.clipboardData.getData("Text")

		let parsedData

		try {
			parsedData = JSON.parse(clipboard) as { type: string; payload: Node<NodeData> }
		} catch (error) {
			return
		}

		if (parsedData.type !== APP_HANDLE) {
			return
		}

		const { addNode } = get()

		const node = parsedData.payload

		node.position.x += 20
		node.position.y += 20

		node.id = getId()

		addNode(node)
	},

	addEdge: (edge) => {
		const { edges, setEdges } = get()
		setEdges([...edges, edge])
	},

	addNode: (node) => {
		const { nodes, setNodes, addChange } = get()
		setNodes([...nodes, node])
		addChange({
			changeType: MenuServiceChangeType.NodeAdd,
			nodeId: node.id,
			meta: {
				position: node.position,
			},
			name: node.data.name,
			renderTemplate: node.data.renderTemplate,
			terminal: node.data.terminal || false,
			type: node.data.type,
			directRoute: node.data.directRoute,
		})

		node.data.postPlugins?.forEach((plugin) => {
			addChange({
				changeType: MenuServiceChangeType.PostPluginAdd,
				nodeId: node.id,
				plugin: plugin as any,
			})
		})
		node.data.prePlugins?.forEach((plugin) => {
			addChange({
				changeType: MenuServiceChangeType.PrePluginAdd,
				nodeId: node.id,
				plugin: plugin as any,
			})
		})
	},

	deleteEdge: (edgeId) => {
		const { edges, setEdges } = get()
		setEdges(edges.filter((edge) => edge.id !== edgeId))
	},

	onDrop: (event) => {
		event.preventDefault()
		event.stopPropagation()

		const type = event.dataTransfer.getData("application/reactflow") as ToolType
		const { reactFlowInstance, addNode } = get()

		if (!type || !reactFlowInstance) return

		const position = reactFlowInstance.screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		})

		const nodeData = COMPONENT_CREATION_DEFAULT[type]()

		const newNode: Node<NodeData, NodeType> = {
			id: getId(),
			type: nodeData.type,
			position,
			data: nodeData,
		}
		addNode(newNode)
	},

	onDragOver: (event) => {
		event.preventDefault()
		event.dataTransfer.dropEffect = "move"
	},

	updateNodeData: (nodeId, dispatch) => {
		const { nodes, setNodes, addChange } = get()

		setNodes(
			nodes.map((n) =>
				n.id === nodeId
					? {
							...n,
							data: {
								...n.data,
								...(typeof dispatch === "function" ? dispatch(n) : dispatch),
							},
					  }
					: n
			)
		)

		addChange({
			changeType: MenuServiceChangeType.NodeMetaChange,
			nodeId,

			...(typeof dispatch === "function"
				? dispatch(nodes.find((n) => n.id === nodeId)!)
				: dispatch),
		})
	},

	updateNode: (nodeId, dispatch) => {
		const { nodes, setNodes } = get()
		setNodes(
			nodes.map((n) =>
				n.id === nodeId
					? {
							...n,
							...(typeof dispatch === "function" ? dispatch(n) : dispatch),
					  }
					: n
			)
		)
	},

	// todo: handle edge removal when removing router plugin
	removePlugin: (nodeId, pluginId, isPostPlugin = true) => {
		const { updateNodeData: updateNode, addChange } = get()

		updateNode(nodeId, (node) => {
			const updatedPlugins = isPostPlugin
				? node.data.postPlugins.filter((p) => p.id !== pluginId)
				: node.data.prePlugins.filter((p) => p.id !== pluginId)
			return {
				...node.data,
				[isPostPlugin ? "postPlugins" : "prePlugins"]: updatedPlugins,
			}
		})

		if (isPostPlugin) {
			addChange({ changeType: MenuServiceChangeType.PostPluginRemove, pluginId, nodeId })
		} else {
			addChange({ changeType: MenuServiceChangeType.PrePluginRemove, pluginId, nodeId })
		}
	},

	removeNode: (nodeId) => {
		const {
			addChange,
			nodes,
			setNodes,
			edges,
			setEdges,
			updateNodeMeta,
			updatePrePlugin,
			updatePostPlugin,
		} = get()

		// Create a map for fast node lookup
		const nodeMap = new Map(nodes.map((node) => [node.id, node]))

		// Find all edges that point to the node being removed
		const linkedEdges = edges.filter((edge) => edge.target === nodeId)

		// Process each linked edge to clean up references
		for (const edge of linkedEdges) {
			const sourceNodeId = edge.source
			const edgeId = edge.id
			const sourceNode = nodeMap.get(sourceNodeId)

			if (!sourceNode) continue

			// Handle direct routes (for start nodes)
			if (sourceNode.data.directRoute?.edgeId === edgeId) {
				updateNodeMeta(sourceNodeId, {
					directRoute: {
						edgeId: "",
						targetMenuId: "",
					},
				})
			}

			// Handle router plugin routes
			const allPlugins = [
				...(sourceNode.data.prePlugins || []).map((p) => ({ plugin: p, isPost: false })),
				...(sourceNode.data.postPlugins || []).map((p) => ({ plugin: p, isPost: true })),
			]

			for (const { plugin, isPost } of allPlugins) {
				if (plugin.type === "router" && plugin.config?.routes) {
					const routeToUpdate = plugin.config.routes.find((route) => route.targetMenuId === nodeId)

					if (routeToUpdate) {
						const updatedPlugin = {
							...plugin,
							config: {
								...plugin.config,
								routes: plugin.config.routes.map((route) =>
									route.targetMenuId === nodeId ? { ...route, targetMenuId: "", edgeId: "" } : route
								),
							},
						}

						if (isPost) {
							updatePostPlugin(sourceNodeId, plugin.id, updatedPlugin)
						} else {
							updatePrePlugin(sourceNodeId, plugin.id, updatedPlugin)
						}
					}
				}
			}
		}

		// Remove all edges connected to this node

		// Remove the node and update edges
		set((state) => ({
			nodes: state.nodes.filter((n) => n.id !== nodeId),
			edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
		}))

		// Add the node removal change
		addChange({ changeType: MenuServiceChangeType.NodeRemove, nodeId })
	},

	updateEnvironmentVariables: (envs: Record<string, string>) => {
		set({ serviceEnvs: envs })
		get().updateServiceMeta(undefined, envs)
	},

	getEnvironmentVariables: () => {
		return get().serviceEnvs
	},

	setEnvironmentVariables: (envs: Record<string, string>) => {
		set({ serviceEnvs: envs })
	},
}))
