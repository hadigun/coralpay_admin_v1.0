import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ToolType } from "@/types"
import { ICON_MAP } from "@/constants/tools"
import HelpIcon from "@/assets/icons/help.png"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { EditableTitle } from "@/components/common/editable-title"
import { ScrollArea } from "@/components//ui/scroll-area"
import { EnvironmentVariablesSection } from "./environment-variables-section"
import Image from "next/image"

export function ToolSearchBar() {
	return (
		<div>
			<Input
				placeholder="Search"
				className="rounded-md focus-visible:ring-1 focus-visible:border-none"
			/>
		</div>
	)
}

interface Tool {
	name: ToolType
	title: string
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface ToolSection {
	name: string
	className: string
	tools: Tool[]
}

const TOOL_SECTIONS: ToolSection[] = [
	{
		name: "Display",
		className: "text-green-600",
		tools: [
			{
				title: "Template",
				name: "display_text",
				icon: ICON_MAP["display_text"],
			},
		],
	},
	{
		name: "Plugins",
		className: "text-blue-600",
		tools: [
			{
				title: "Router",
				name: "plugin_router",
				icon: ICON_MAP["plugin_router"],
			},
			{
				title: "Payment",
				name: "plugin_payment",
				icon: ICON_MAP["plugin_payment"],
			},
			{
				name: "plugin_apicall",
				title: "API Call",
				icon: ICON_MAP["plugin_apicall"],
			},
		],
	},
	{
		name: "Validations",
		className: "text-red-600",
		tools: [
			{
				title: "Text",
				name: "input_text",
				icon: ICON_MAP["input_text"],
			},
			{
				title: "Number",
				name: "input_number",
				icon: ICON_MAP["input_number"],
			},
			{ title: "Email", name: "input_email", icon: ICON_MAP["input_email"] },
			{ title: "Phone", name: "input_phone", icon: ICON_MAP["input_phone"] },
			{ title: "Website", name: "input_website", icon: ICON_MAP["input_website"] },
		],
	},
	{
		name: "Logic",
		className: "text-purple-600",
		tools: [
			{
				title: "Set variable",
				name: "logic_set_variable",
				icon: ICON_MAP["logic_set_variable"],
			},
		],
	},
	{
		name: "Events",
		className: "text-orange-600",
		tools: [
			{
				title: "Start",
				name: "event_start",
				icon: ICON_MAP["event_start"],
			},
			{
				name: "event_end",
				title: "End",
				icon: ICON_MAP["event_end"],
			},
		],
	},
]

interface ToolProps {
	tool: Tool
	className?: string
}

function Tool({ tool, className }: ToolProps) {
	const onDragStart = (event: React.DragEvent) => {
		event.dataTransfer.setData("application/reactflow", tool.name)
		// event.dataTransfer.effectAllowed = "move"
	}

	const onDragEnd = (event: React.DragEvent) => {
		event.preventDefault()
		event.dataTransfer.clearData()
	}

	const Icon = tool.icon

	return (
		<div
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			draggable
			key={tool.name}
			className={cn(
				"flex items-center p-2 px-3 bg-[#A476B214] rounded-lg cursor-pointer select-none"
			)}
		>
			<Icon className={cn("h-4 w-4", className)} />
			<span className="ml-2 text-sm font-bold text-text-tertiary">{tool.title}</span>
		</div>
	)
}

interface ToolSectionProps {
	section: ToolSection
}

function ToolSection({ section }: ToolSectionProps) {
	return (
		<div className="p-2">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm text-text-primary ml-3 font-bold">{section.name}</h3>
				<Image src={HelpIcon} alt="Help" className="w-4.5 h-4.5" />
			</div>
			<div className="grid grid-cols-2 gap-4">
				{section.tools.map((tool) => (
					<Tool key={tool.name} tool={tool} />
				))}
			</div>
		</div>
	)
}

function ShortCodeOption() {
	const availbleShortCodes = ["*123#", "*456#", "*789#", "*111#", "*222#"]
	return (
		<div className="p-2">
			<div className="font-bold text-sm mb-2">Short Code</div>
			<Select>
				<SelectTrigger className="w-full font-bold text-base border-none shadow-none bg-lineColor !py-6">
					<SelectValue placeholder="Select a shortcode" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Short Codes</SelectLabel>
						{availbleShortCodes.map((code) => (
							<SelectItem key={code} value={code} className="font-bold">
								{code}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	)
}

function ServiceNameInput() {
	return (
		<div className="p-2">
			<div className="font-bold text-sm mb-2">Service Name</div>
			<div className="p-3 bg-lineColor rounded-lg">
				<EditableTitle
					className="!text-base font-bold w-full"
					value="My Service"
					onSave={() => {}}
				/>
			</div>
		</div>
	)
}

export function ToolsPanel() {
	return (
		<ScrollArea className="h-full p-2 space-y-3 w-78 bg-[#fdfdfe] rounded-3xl overflow-hidden">
			<ServiceNameInput />
			<ShortCodeOption />
			<EnvironmentVariablesSection />
			<div className="space-y-5 pt-3">
				{TOOL_SECTIONS.map((section) => (
					<ToolSection key={section.name} section={section} />
				))}
			</div>
		</ScrollArea>
	)
}
