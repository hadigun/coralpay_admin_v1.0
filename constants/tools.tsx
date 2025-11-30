import { MenuNodeType } from "@mobiresoft-coral/ussd-shared-core"
import type { InputToolType, NodeData, NodeType, Plugin, PluginToolType, ToolType } from "@/types"
import { StartNode } from "@/components/nodes/start"
import { EndNode } from "@/components/nodes/end"
import { MenuNode } from "@/components/nodes/menu"

import TemplateIcon from "@/assets/icons/template.png"
import RouterIcon from "@/assets/icons/router.png"
import PaymentIcon from "@/assets/icons/payment.png"
import ApiCallIcon from "@/assets/icons/api.png"
import MailIcon from "@/assets/icons/mail.png"
import PhoneIcon from "@/assets/icons/phone.png"
import GlobeIcon from "@/assets/icons/web.png"
import VariableIcon from "@/assets/icons/tree.png"
import TextIcon from "@/assets/icons/text.png"
import NumberIcon from "@/assets/icons/number.png"

import {
	createApiPlugin,
	createEmailInputPlugin,
	createNodeData,
	createNumberInputPlugin,
	createPaymentPlugin,
	createPhoneInputPlugin,
	createRouterPlugin,
	createTextInputPlugin,
	createWebsiteInputPlugin,
} from "@/lib/plugin-utils"

import { Ban, Play } from "lucide-react"
import {
	MarkerType,
	type Edge,
	type EdgeMarkerType,
	type Node,
	type NodeProps,
} from "@xyflow/react"
import type React from "react"
import { createImageIcon } from "@/lib/utils"

export const ICON_MAP: Record<ToolType, React.ComponentType<any>> = {
	display_text: createImageIcon(TemplateIcon, "Template"),
	plugin_router: createImageIcon(RouterIcon, "Router"),
	plugin_payment: createImageIcon(PaymentIcon, "Payment"),
	plugin_apicall: createImageIcon(ApiCallIcon, "API Call"),
	input_text: createImageIcon(TextIcon, "Text"),
	input_number: createImageIcon(NumberIcon, "Number"),
	input_email: createImageIcon(MailIcon, "Email"),
	input_phone: createImageIcon(PhoneIcon, "Phone"),
	input_website: createImageIcon(GlobeIcon, "Website"),
	logic_set_variable: createImageIcon(VariableIcon, "Set Variable"),
	event_start: Play,
	event_end: Ban,
}

export const PLUGIN_TOOL_TYPES = ["plugin_router", "plugin_payment", "plugin_apicall"] as const

export const INPUT_TOOL_TYPES = [
	"input_text",
	"input_number",
	"input_email",
	"input_phone",
	"input_website",
] as const

export const TOOL_TYPE_TO_PLUGIN: Record<PluginToolType | InputToolType, () => Plugin> = {
	plugin_apicall: createApiPlugin,
	plugin_payment: createPaymentPlugin,
	plugin_router: createRouterPlugin,
	input_number: createNumberInputPlugin,
	input_phone: createPhoneInputPlugin,
	input_email: createEmailInputPlugin,
	input_website: createWebsiteInputPlugin,
	input_text: createTextInputPlugin,
}

export const COMPONENT_CREATION_DEFAULT: Record<ToolType, () => NodeData & { type: NodeType }> = {
	event_start: () =>
		createNodeData({ name: "Start", type: MenuNodeType.Start, supportsPlugins: false }),
	event_end: () => createNodeData({ name: "End", type: MenuNodeType.End, supportsPlugins: false }),
	logic_set_variable: () => createNodeData({ name: "Menu", type: MenuNodeType.Menu }),
	display_text: () => createNodeData({ name: "Menu", type: MenuNodeType.Menu }),
	plugin_router: () =>
		createNodeData({ name: "Menu", type: MenuNodeType.Menu, postPlugins: [createRouterPlugin()] }),
	plugin_payment: () =>
		createNodeData({ name: "Menu", type: MenuNodeType.Menu, postPlugins: [createPaymentPlugin()] }),
	plugin_apicall: () =>
		createNodeData({ name: "Menu", type: MenuNodeType.Menu, postPlugins: [createApiPlugin()] }),
	input_text: () =>
		createNodeData({
			name: "Menu",
			type: MenuNodeType.Menu,
			postPlugins: [createTextInputPlugin()],
		}),
	input_number: () =>
		createNodeData({
			name: "Menu",
			type: MenuNodeType.Menu,
			postPlugins: [createNumberInputPlugin()],
		}),
	input_email: () =>
		createNodeData({
			name: "Menu",
			type: MenuNodeType.Menu,
			postPlugins: [createEmailInputPlugin()],
		}),
	input_phone: () =>
		createNodeData({
			name: "Menu",
			type: MenuNodeType.Menu,
			postPlugins: [createPhoneInputPlugin()],
		}),
	input_website: () =>
		createNodeData({
			name: "Menu",
			type: MenuNodeType.Menu,
			postPlugins: [createWebsiteInputPlugin()],
		}),
}

export const NODE_TYPES: Record<NodeType, React.ComponentType<NodeProps<Node<NodeData>>>> = {
	start: StartNode,
	end: EndNode,
	menu: MenuNode,
}
export const MARKER_END_OPTIONS: EdgeMarkerType = {
	type: MarkerType.Arrow,
	height: 10,
	width: 10,
	color: "#F74F9E",
	strokeWidth: 2,
}

export const EDGE_DEFAULT_OPTIONS: Partial<Edge> = {
	markerEnd: MARKER_END_OPTIONS,
	type: "smoothstep",
	deletable: true,
	style: {
		stroke: "#F74F9E",
		strokeWidth: 2,
	},
}

export const HANDLE_DEFAULT_STYLES: React.CSSProperties = {
	width: 10,
	height: 10,
	borderColor: "#4C0463",
	backgroundColor: "white",
}

export const HANDLE_SECONDARY_STYLES: React.CSSProperties = {
	width: 10,
	height: 10,
	borderColor: "#4C0463",
	backgroundColor: "#A476B2",
}
