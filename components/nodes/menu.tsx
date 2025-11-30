import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { Text } from "lucide-react"
import type { NodeData, Plugin } from "@/types"
import { useNodeAction } from "@/hooks/use-node-action"
import { EditableTitle } from "@/components/common/editable-title"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { memo, useCallback } from "react"
import { MenuComponentBody, MenuComponentOverview } from "@/components/menu/component-overview"
import { RenderTemplateSettings } from "@/components/menu/settings/template-settings"
import { PluginList } from "@/components/menu/plugin-list"
import { Badge } from "@/components/ui/badge"
import { HANDLE_DEFAULT_STYLES } from "@/constants/tools"
import { NodeWrapper } from "@/components/node-wrapper"
import { TextRenderer } from "../simulator/simulator"

function MenuNodeImpl({ id, data }: NodeProps<Node<NodeData>>) {
	const {
		onDropPostPlugin,
		onDropPrePlugin,
		updatePlugin,
		removePostPlugin,
		removePrePlugin,
		reorderPlugins,
		updateNodeMeta,
	} = useNodeAction()

	function updateRenderTemplate(value: string) {
		updateNodeMeta({ renderTemplate: value })
	}

	const onTitleSave = useCallback(
		(value: string) => {
			updateNodeMeta({ name: value })
		},
		[updateNodeMeta]
	)

	const onPrePluginSave = useCallback(
		(id: string, plugin: Plugin) => {
			updatePlugin(id, plugin, false)
		},
		[updatePlugin]
	)

	const onPostPluginSave = useCallback(
		(id: string, plugin: Plugin) => {
			updatePlugin(id, plugin, true)
		},
		[updatePlugin]
	)

	const onPrePluginReorder = useCallback(
		(plugins: Plugin[]) => {
			reorderPlugins(plugins, false)
		},
		[reorderPlugins]
	)

	const onPostPluginReorder = useCallback(
		(plugins: Plugin[]) => {
			reorderPlugins(plugins, true)
		},
		[reorderPlugins]
	)

	return (
		<NodeWrapper>
			<div className="bg-[#FEFAFF] py-2 rounded-3xl border border-[#4c0463] text-sm flex flex-col gap-y-1.5 w-80">
				<div className="flex pl-6 pr-2 py-2 pb-3 border-b border-[#4c0463]">
					<EditableTitle
						className="flex-1 font-bold text-[#222222] text-sm"
						value={data.name}
						onSave={onTitleSave}
					/>
				</div>
				<div onDrop={onDropPrePlugin} className="px-2">
					<div className="bg-white p-2 rounded-lg">
						<span className="text-xs mb-1">Pre-Plugins</span>
						<PluginList
							plugins={data.prePlugins}
							onPluginSave={onPrePluginSave}
							onPluginRemove={removePrePlugin}
							onPluginReorder={onPrePluginReorder}
						/>
						{data.prePlugins.length === 0 && (
							<div className="text-xs text-muted-foreground flex items-center justify-center p-1 py-2">
								Drag and drop pre-plugins here.
							</div>
						)}
					</div>
				</div>
				<div className="px-2">
					<Popover>
						<PopoverTrigger asChild>
							<MenuComponentOverview className="border bg-white border-[#F9F9F9]">
								<MenuComponentBody>
									<div className="flex flex-col gap-y-1">
										<Badge className="text-sm p-1 px-2 gap-x-2">
											<Text className="h-5 w-5" />
											Template
										</Badge>
										<TextRenderer variant="mini" text={data.renderTemplate || "No template set"} />
									</div>
								</MenuComponentBody>
							</MenuComponentOverview>
						</PopoverTrigger>
						<PopoverContent side="left" className="rounded-lg border min-w-80 overflow-y-auto p-0">
							<RenderTemplateSettings
								renderTemplate={data.renderTemplate}
								onSave={updateRenderTemplate}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div onDrop={onDropPostPlugin} className="px-2">
					<div className="bg-white p-2 rounded-lg">
						<span className="text-xs mb-1">Post-Plugins</span>
						<PluginList
							plugins={data.postPlugins}
							onPluginSave={onPostPluginSave}
							onPluginRemove={removePostPlugin}
							onPluginReorder={onPostPluginReorder}
						/>

						{data.postPlugins.length === 0 && (
							<div className="text-xs text-muted-foreground flex items-center justify-center p-1 py-2">
								Drag and drop post-plugins here.
							</div>
						)}
					</div>
				</div>
				<Handle type="target" position={Position.Left} id={id} style={HANDLE_DEFAULT_STYLES} />
			</div>
		</NodeWrapper>
	)
}

export const MenuNode = memo(MenuNodeImpl, (prev, next) => {
	return prev.data === next.data && prev.id === next.id
})
