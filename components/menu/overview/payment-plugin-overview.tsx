import { Badge } from "@/components/ui/badge"
import type { PaymentPlugin } from "@mobiresoft-coral/ussd-shared-core"

interface PaymentPluginOverviewProps {
	plugin: PaymentPlugin
}

export function PaymentPluginOverview({ plugin }: PaymentPluginOverviewProps) {
	const { amount } = plugin.config

	return (
		<div className="space-y-1">
			<div className="flex gap-2 items-center">
				<span className="text-xs text-muted-foreground">Amount:</span>
				<Badge variant="outline" className="text-xs">
					<span className="truncate">{amount || "Not set"}</span>
				</Badge>
			</div>
		</div>
	)
}
