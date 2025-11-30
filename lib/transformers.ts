import type { EdgeData, NodeData } from "@/types"
import type { MenuService } from "@mobiresoft-coral/ussd-shared-core"
import type { Node, Edge } from "@xyflow/react"

export function transformServiceToNodesAndEdges(service: MenuService): {
	nodes: Node<NodeData>[]
	edges: Edge<EdgeData>[]
} {
	const nodes: Node<NodeData>[] = service.menus.map((menu) => ({
		id: menu.id,
		position: menu.meta.position || { x: 0, y: 0 },
		data: menu as unknown as NodeData,
		type: menu.type,
	}))

	const edges: Edge[] = []

	return { nodes, edges }
}
