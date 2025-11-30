import { Badge } from "@/components/ui/badge"
import type { ApiCallPlugin } from "@mobiresoft-coral/ussd-shared-core"

interface ApiCallPluginOverviewProps {
	plugin: ApiCallPlugin
}

export function ApiCallPluginOverview({ plugin }: ApiCallPluginOverviewProps) {
	const { url, method } = plugin.config

	return (
		<div className="gap-x-1 flex items-center">
			<Badge variant="default" className="text-[0.6rem]">
				{method || "Not set"}
			</Badge>
			<Badge variant="outline" className="text-xs flex-auto">
				<span className="truncate">{url || "Not set"}</span>
			</Badge>
		</div>
	)
}
