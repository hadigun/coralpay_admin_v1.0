import type { Plugin } from "@/types"
import { ValidationPluginOverview } from "@/components/menu/overview/validation-plugin-overview"
import { PaymentPluginOverview } from "@/components/menu/overview/payment-plugin-overview"
import { ApiCallPluginOverview } from "@/components/menu/overview/apicall-plugin-overview"
import { RouterPluginOverview } from "@/components/menu/overview/router-plugin-overview"

interface PluginViewProps {
	plugin: Plugin
	onPluginSave: (pluginId: string, plugin: Plugin) => void
}

export function PluginView({ plugin, onPluginSave }: PluginViewProps) {
	switch (plugin.type) {
		case "api_call":
			return <ApiCallPluginOverview plugin={plugin} />
		case "payment":
			return <PaymentPluginOverview plugin={plugin} />
		case "router":
			return <RouterPluginOverview plugin={plugin} onPluginSave={onPluginSave} />
		case "validation":
			return <ValidationPluginOverview plugin={plugin} />
	}
}
