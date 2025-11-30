import { Input } from "@/components/ui/plain-input"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useCallback, useState, type ChangeEvent } from "react"
import { useDebouncer } from "@/hooks/use-debouncer"
import type { KeyValuePair } from "@/types"
import type { ApiCallPlugin } from "@mobiresoft-coral/ussd-shared-core"
import { getId, keyValuePairsToObject, objectToKeyValuePairs } from "@/lib/utils"
import { KeyValueSelect } from "@/components/common/key-value-select"
import { DEBOUNCE_TIME } from "@/constants/common"
import { SmartInput } from "@/components/smart-input"

interface ApiCallPluginSettingsProps {
	plugin: ApiCallPlugin
	onSave: (id: string, plugin: ApiCallPlugin) => void
}

export function ApiCallPluginSettings({ plugin, onSave }: ApiCallPluginSettingsProps) {
	const [config, setConfig] = useState(plugin.config)
	const [queryParams, setQueryParams] = useState<KeyValuePair[]>(() =>
		objectToKeyValuePairs(config.queryParams)
	)
	const [headers, setHeaders] = useState<KeyValuePair[]>(() =>
		objectToKeyValuePairs(config.headers)
	)

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

	const updateQueryParams = useCallback(
		(newParams: KeyValuePair[]) => {
			setQueryParams(newParams)
			updateConfig({ queryParams: keyValuePairsToObject(newParams) })
		},
		[updateConfig]
	)

	const updateHeaders = useCallback(
		(newHeaders: KeyValuePair[]) => {
			setHeaders(newHeaders)
			updateConfig({ headers: keyValuePairsToObject(newHeaders) })
		},
		[updateConfig]
	)

	const addQueryParam = useCallback(() => {
		updateQueryParams([...queryParams, { key: "", value: "", id: getId() }])
	}, [queryParams, updateQueryParams])

	const removeQueryParam = useCallback(
		(id: string) => {
			updateQueryParams(queryParams.filter((param) => param.id !== id))
		},
		[queryParams, updateQueryParams]
	)

	const updateQueryParam = useCallback(
		(id: string, field: "key" | "value", value: string) => {
			updateQueryParams(
				queryParams.map((param) => (param.id === id ? { ...param, [field]: value } : param))
			)
		},
		[queryParams, updateQueryParams]
	)

	const addHeader = useCallback(() => {
		updateHeaders([...headers, { key: "", value: "", id: getId() }])
	}, [headers, updateHeaders])

	const removeHeader = useCallback(
		(id: string) => {
			updateHeaders(headers.filter((header) => header.id !== id))
		},
		[headers, updateHeaders]
	)

	const updateHeader = useCallback(
		(id: string, field: "key" | "value", value: string) => {
			updateHeaders(
				headers.map((header) => (header.id === id ? { ...header, [field]: value } : header))
			)
		},
		[headers, updateHeaders]
	)

	const handleUrlUpdate = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			updateConfig({ url: e.target.value })
		},
		[updateConfig]
	)

	return (
		<div className="flex flex-col gap-y-4">
			<div className="flex flex-col gap-y-2">
				<span className="font-normal">URL:</span>
				<SmartInput
					value={config.url || ""}
					onChange={handleUrlUpdate}
					placeholder="https://api.example.com/endpoint"
					className="focus-visible:border-0 focus-visible:ring-2"
				/>
			</div>

			<div className="flex flex-col gap-y-2">
				<span className="font-normal">HTTP Method:</span>
				<Select
					value={config.method || ""}
					onValueChange={(value: ApiCallPlugin["config"]["method"]) =>
						updateConfig({ method: value })
					}
				>
					<SelectTrigger className="focus-visible:border-0 focus-visible:ring-2">
						<SelectValue placeholder="Select method..." />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="GET">GET</SelectItem>
						<SelectItem value="POST">POST</SelectItem>
						<SelectItem value="PUT">PUT</SelectItem>
						<SelectItem value="DELETE">DELETE</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-y-2">
				<span className="font-normal">Output Key:</span>
				<Input
					value={config.outputKey || ""}
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						updateConfig({ outputKey: e.target.value })
					}
					placeholder="Output key for response data"
					className="focus-visible:border-0 focus-visible:ring-2"
				/>
			</div>

			<KeyValueSelect
				title="Query Parameters"
				pairs={queryParams}
				onAdd={addQueryParam}
				onRemove={removeQueryParam}
				onUpdate={updateQueryParam}
			/>

			<KeyValueSelect
				title="Headers"
				pairs={headers}
				onAdd={addHeader}
				onRemove={removeHeader}
				onUpdate={updateHeader}
			/>

			<div className="flex flex-col gap-y-2">
				<span className="font-normal">Request Body:</span>
				<Textarea
					value={config.body}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
						updateConfig({ body: e.target.value })
					}}
					placeholder={`{\n  "key": "value",\n  "data": "example"\n}`}
					className="min-h-[100px] font-mono text-sm focus-visible:border-0 focus-visible:ring-2"
				/>
			</div>
		</div>
	)
}
