import { Badge } from "@/components/ui/badge"
import type { ValidationPlugin } from "@mobiresoft-coral/ussd-shared-core"
import { ArrowRight } from "lucide-react"

interface ValidationPluginOverviewProps {
	plugin: ValidationPlugin
}

export function ValidationPluginOverview({ plugin }: ValidationPluginOverviewProps) {
	const { inputKey, outputKey } = plugin.config
	const name = plugin.toolType.replace("input_", "")
	const camelCaseName = name.charAt(0).toUpperCase() + name.slice(1)

	return (
		<div className="space-y-1 text-xs">
			<div className="flex items-center gap-2">
				<Badge className="text-xs">{camelCaseName}</Badge>
			</div>
			<div className="flex items-center gap-2">
				<Badge variant="outline" className="text-xs flex-auto !w-fit">
					<span className="truncate">{inputKey || "Not set"}</span>
				</Badge>
				<ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
				<Badge variant="outline" className="text-xs flex-auto w-fit">
					<span className="truncate">{outputKey || "Not set"}</span>
				</Badge>
			</div>
		</div>
	)
}
