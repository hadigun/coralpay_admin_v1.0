import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { Play } from "lucide-react"
import type { NodeData } from "@/types"
import { useMenuBuilderStore } from "@/hooks/use-menu-builder-store"
import { useNodeAction } from "@/hooks/use-node-action"
import { EDGE_DEFAULT_OPTIONS, HANDLE_SECONDARY_STYLES } from "@/constants/tools"
import { NodeWrapper } from "@/components/node-wrapper"

export function StartNode({ id, data }: NodeProps<Node<NodeData>>) {
	const store = useMenuBuilderStore()

	const addEdge = store((s) => s.addEdge)
	const deleteEdge = store((s) => s.deleteEdge)

	const { updateNodeMeta } = useNodeAction()

	return (
		<NodeWrapper>
			<div className="text-xs rounded-lg bg-[#222222]">
				<div className="px-3 py-2 pr-5 font-medium flex gap-x-2 justify-between items-center text-white">
					<Play fill="white" className="h-3 w-3" />
					{data.name}
				</div>
				<Handle
					onConnect={(connection) => {
						if (data?.directRoute?.edgeId) {
							deleteEdge(data.directRoute.edgeId)
						}

						const edgeId = id

						addEdge({
							id: edgeId,
							source: id,
							target: connection.target!,
							sourceHandle: connection.sourceHandle,
							targetHandle: connection.targetHandle,
							...EDGE_DEFAULT_OPTIONS,
							
						})

						updateNodeMeta({
							directRoute: {
								targetMenuId: connection.target!,
								edgeId,
							},
						})
					}}
					type="source"
					position={Position.Right}
					style={HANDLE_SECONDARY_STYLES}
					id={id}
				/>
			</div>
		</NodeWrapper>
	)
}
