import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { Flag } from "lucide-react"
import type { NodeData } from "@/types"
import { HANDLE_SECONDARY_STYLES } from "@/constants/tools"
import { NodeWrapper } from "@/components/node-wrapper"

export function EndNode({ id, data }: NodeProps<Node<NodeData>>) {
	return (
		<NodeWrapper>
			<div className="text-xs rounded-lg bg-[#222222]">
				<div className="px-4 py-2 font-medium flex gap-x-2 justify-between items-center text-white">
					<Flag fill="white" className="h-3 w-3" />
					{data.name}
				</div>
				<Handle type="target" position={Position.Left} id={id} style={HANDLE_SECONDARY_STYLES} />
			</div>
		</NodeWrapper>
	)
}
