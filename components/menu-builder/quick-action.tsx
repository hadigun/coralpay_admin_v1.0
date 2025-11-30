import TipIcon from "@/assets/icons/tip.png"
import PlayIcon from "@/assets/icons/play.png"
import "@xyflow/react/dist/style.css"
import { Button } from "@/components/ui/button"
import { createImageIcon } from "@/lib/utils"
import { useMenuBuilderStore } from "@/hooks/use-menu-builder-store"

const Tip = createImageIcon(TipIcon, "Tips")
const Play = createImageIcon(PlayIcon, "Simulate")

interface QuickActionProps {
	isSimulating?: boolean
}

export function QuickAction({ isSimulating = false }: QuickActionProps) {
	const store = useMenuBuilderStore()
	const closeEmulator = store((s) => s.closeSimulator)
	const openSimulator = store((s) => s.openSimulator)

	return (
		<div className="flex gap-4">
			{!isSimulating && (
				<>
					<Button variant="outline" className="gap-3 border-primary text-primary font-bold">
						<Tip className="w-4" />
						Tips
					</Button>
					<Button
						onClick={() => {
							openSimulator({})
						}}
						className="bg-background-secondary hover:bg-initial text-primary gap-3 font-bold"
					>
						<Play className="w-4" />
						Simulate
					</Button>
				</>
			)}

			{isSimulating && (
				<Button
					variant="outline"
					className="border-primary text-primary font-bold"
					onClick={closeEmulator}
				>
					Close
				</Button>
			)}
			<Button className="font-semibold">Send Publish Request</Button>
		</div>
	)
}
