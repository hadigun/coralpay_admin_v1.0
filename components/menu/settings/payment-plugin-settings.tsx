import { Input } from "@/components/ui/plain-input"
import { useCallback, useState, type ChangeEvent } from "react"
import { useDebouncer } from "@/hooks/use-debouncer"
import type { PaymentPlugin } from "@mobiresoft-coral/ussd-shared-core"
import { DEBOUNCE_TIME } from "@/constants/common"

interface PaymentPluginSettingsProps {
	plugin: PaymentPlugin
	onSave: (id: string, plugin: PaymentPlugin) => void
}

export function PaymentPluginSettings({ plugin, onSave }: PaymentPluginSettingsProps) {
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

	// const onEndTemplateChange = useCallback(
	// 	(e: ChangeEvent<HTMLInputElement>) => {
	// 		updateConfig({ endTemplate: e.target.value })
	// 	},
	// 	[updateConfig]
	// )

	const onAmountChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			updateConfig({ amount: e.target.value })
		},
		[updateConfig]
	)

	return (
		<div className="flex flex-col gap-y-4">
			{/* <div className="flex flex-col gap-y-2">
				<span className="font-normal">End Template:</span>
				<Input
					value={config.endTemplate}
					onChange={onEndTemplateChange}
					placeholder="Enter end template..."
					className="focus-visible:border-0 focus-visible:ring-2"
				/>
			</div> */}

			<div className="flex flex-col gap-y-2">
				<span className="font-normal">Amount:</span>
				<Input
					value={config.amount}
					onChange={onAmountChange}
					placeholder="Enter amount..."
					className="focus-visible:border-0 focus-visible:ring-2"
				/>
			</div>
		</div>
	)
}
