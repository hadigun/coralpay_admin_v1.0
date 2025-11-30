import { Input } from "@/components/ui/plain-input"
import { useCallback, useState, type ChangeEvent } from "react"
import { useDebouncer } from "@/hooks/use-debouncer"
import type { ValidationPlugin } from "@mobiresoft-coral/ussd-shared-core"
import { Switch } from "@/components/ui/switch"
import { DEBOUNCE_TIME } from "@/constants/common"

interface ValidationPluginSettingsProps {
	plugin: ValidationPlugin
	onSave: (id: string, plugin: ValidationPlugin) => void
}

export function ValidationPluginSettings({ plugin, onSave }: ValidationPluginSettingsProps) {
	const [config, setConfig] = useState(plugin.config)

	const debouncedOnSave = useDebouncer((newConfig: typeof config) => {
		onSave(plugin.id, {
			...plugin,
			config: newConfig,
		})
	}, DEBOUNCE_TIME)

	const updateConfig = useCallback(
		(updates: Partial<typeof config>) => {
			const newConfig = { ...config, ...updates }
			setConfig(newConfig)
			debouncedOnSave(newConfig)
		},
		[config, debouncedOnSave]
	)

	const onInputKeyChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			updateConfig({ inputKey: e.target.value })
		},
		[updateConfig]
	)

	const onRegexpChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			updateConfig({ regexp: e.target.value })
		},
		[updateConfig]
	)

	const onOutputKeyChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			updateConfig({ outputKey: e.target.value })
		},
		[updateConfig]
	)

	const onMessageChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			updateConfig({ message: e.target.value })
		},
		[updateConfig]
	)

	const onIsNumericChange = useCallback(
		(checked: boolean) => {
			updateConfig({ isNumeric: checked })
		},
		[updateConfig]
	)

	return (
		<div className="flex flex-col gap-y-4">
			<div className="flex flex-col gap-y-2">
				<span className="font-normal">Input Key:</span>
				<Input
					value={config.inputKey}
					onChange={onInputKeyChange}
					placeholder="Enter input key..."
					className="focus-visible:border-0 focus-visible:ring-2"
				/>
			</div>

			<div className="flex flex-col gap-y-2">
				<span className="font-normal">Regular Expression:</span>
				<Input
					value={config.regexp}
					onChange={onRegexpChange}
					placeholder="Enter regex pattern..."
					className="focus-visible:border-0 focus-visible:ring-2"
				/>
			</div>

			<div className="flex flex-col gap-y-2">
				<span className="font-normal">Output Key:</span>
				<Input
					value={config.outputKey}
					onChange={onOutputKeyChange}
					placeholder="Enter output key..."
					className="focus-visible:border-0 focus-visible:ring-2"
				/>
			</div>

			<div className="flex flex-col gap-y-2">
				<span className="font-normal">Validation Message:</span>
				<Input
					value={config.message}
					onChange={onMessageChange}
					placeholder="Enter validation message..."
					className="focus-visible:border-0 focus-visible:ring-2"
				/>
			</div>

			<div className="flex items-center gap-x-2 justify-between">
				<span className="font-normal cursor-pointer">Is Numeric:</span>
				<Switch checked={config.isNumeric || false} onCheckedChange={onIsNumericChange} />
			</div>
		</div>
	)
}
