import { Input } from "@/components/ui/plain-input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { KeyValuePair } from "@/types"

interface KeyValueSelectProps {
	title: string
	pairs: KeyValuePair[]
	onAdd: () => void
	onRemove: (id: string) => void
	onUpdate: (id: string, field: "key" | "value", value: string) => void
}

export const KeyValueSelect = ({
	title,
	pairs,
	onAdd,
	onRemove,
	onUpdate,
}: KeyValueSelectProps) => {
	const titleId = `kv-title-${title.toLowerCase().replace(/\s+/g, "-")}`

	return (
		<div className="flex flex-col gap-y-2" role="group" aria-labelledby={titleId}>
			<div className="flex items-center justify-between">
				<span id={titleId} className="font-normal">
					{title}:
				</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onAdd}
					className="h-8 px-2"
					aria-label={`Add new ${title.toLowerCase()} pair`}
				>
					<Plus className="h-4 w-4 mr-1" aria-hidden="true" />
					Add
				</Button>
			</div>
			<div className="space-y-2" role="group" aria-label={`${title} pairs`}>
				{pairs.map((pair, index) => (
					<div
						key={pair.id}
						className="flex items-center gap-2"
						role="group"
						aria-label={`${title} pair ${index + 1}`}
					>
						<label htmlFor={`key-${pair.id}`} className="sr-only">
							Key for {title.toLowerCase()} {index + 1}
						</label>
						<Input
							id={`key-${pair.id}`}
							value={pair.key}
							onChange={(e) => onUpdate(pair.id, "key", e.target.value)}
							placeholder="Key"
							className="flex-1 focus-visible:border-0 focus-visible:ring-2"
						/>
						<label htmlFor={`value-${pair.id}`} className="sr-only">
							Value for {title.toLowerCase()} {index + 1}
						</label>
						<Input
							id={`value-${pair.id}`}
							value={pair.value}
							onChange={(e) => onUpdate(pair.id, "value", e.target.value)}
							placeholder="Value"
							className="flex-1 focus-visible:border-0 focus-visible:ring-2"
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => onRemove(pair.id)}
							className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
							disabled={pairs.length === 1}
							aria-label={`Remove ${title.toLowerCase()} pair ${index + 1}${
								pair.key ? ` (${pair.key})` : ""
							}`}
						>
							<Trash2 className="h-4 w-4" aria-hidden="true" />
						</Button>
					</div>
				))}
			</div>
		</div>
	)
}
