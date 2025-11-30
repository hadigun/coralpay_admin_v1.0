import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Simulator } from "@/components/simulator/simulator"
import { useMenuBuilderStore } from "@/hooks/use-menu-builder-store"
import { QuickAction } from "../menu-builder/quick-action"

export function EmulatorPanel() {
	const store = useMenuBuilderStore()
	const simulatorConfig = store((s) => s.simulatorConfig)

	if (!simulatorConfig.open) {
		return null
	}

	return (
		<div className="absolute top-0 right-0 h-full w-full bg-[#e5e0e8] flex items-center justify-center">
			<div className="w-[26rem]">
				<Simulator config={simulatorConfig} />
			</div>
			<div className="absolute top-0 right-0 p-4">
				<QuickAction isSimulating={true} />
			</div>
		</div>
	)
}
