import { Button } from "@/components/ui/button"

import PlusIcon from "@/assets/icons/plus.png"
import MinusIcon from "@/assets/icons/minus.png"
import FocusIcon from "@/assets/icons/focus.png"
import { createImageIcon } from "@/lib/utils"
import { useReactFlow } from "@xyflow/react"

const Plus = createImageIcon(PlusIcon, "Zoom In")
const Minus = createImageIcon(MinusIcon, "Zoom Out")
const Focus = createImageIcon(FocusIcon, "Focus")

export function SceneControls() {
	const { zoomIn, zoomOut, fitView } = useReactFlow()
	return (
		<div className="flex gap-2 items-center">
			<div className="font-bold text-sm">Zoom</div>
			<Button title="Zoom In" variant="unstyled" className="p-0 h-auto" onClick={() => zoomIn()}>
				<Plus className="w-4 h-4" />
			</Button>
			<Button title="Zoom Out" variant="unstyled" className="p-0 h-auto" onClick={() => zoomOut()}>
				<Minus className="w-4 h-4" />
			</Button>
			<Button title="Fit View" variant="unstyled" className="p-0 h-auto" onClick={() => fitView()}>
				<Focus className="w-4 h-4" />
			</Button>
		</div>
	)
}
