import { Textarea } from "@/components/ui/textarea"
import { useCallback, useState, type ChangeEvent } from "react"
import { useDebouncer } from "@/hooks/use-debouncer"
import { DEBOUNCE_TIME } from "@/constants/common"
import { Text } from "lucide-react"
import { SmartTextarea } from "@/components/smart-input"
import { useMenuBuilderStore } from "@/hooks/use-menu-builder-store"

interface RenderTemplateSettingsProps {
	onSave: (renderTemplate: string) => void
	renderTemplate: string
}

export function RenderTemplateSettings({ onSave, renderTemplate }: RenderTemplateSettingsProps) {
	const [template, setTemplate] = useState(renderTemplate)

	const debouncedOnSave = useDebouncer(onSave, DEBOUNCE_TIME)

	const onChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			setTemplate(e.target.value)
			debouncedOnSave(e.target.value)
		},
		[debouncedOnSave, setTemplate]
	)

	const store = useMenuBuilderStore()

	const envs = store((s) => s.serviceEnvs)

	return (
		<div className="pt-0">
			<div className="bg-[#FCFDFD] py-2.5 px-4 text-sm flex items-center gap-x-2">
				<Text className="h-5 w-5" />
				Template
			</div>
			<div className="p-4 pt-0 flex flex-col gap-y-1 mt-2">
				<span className="font-normal">Content</span>
				<SmartTextarea
					id="template"
					value={template}
					onChange={onChange}
					placeholder="Enter your template here..."
					className="min-h-[160px] focus-visible:border-0 border-[#909090] focus-visible:ring-2 focus-visible:ring-[#909090]"
					variables={envs}
				/>
			</div>
		</div>
	)
}
