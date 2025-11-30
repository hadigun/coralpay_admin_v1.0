import { use, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EnvironmentVariablesManager } from "./environment-variables-manager"
import { useMenuBuilderStore } from "@/hooks/use-menu-builder-store"
import { Settings } from "lucide-react"
import HelpIcon from "@/assets/icons/help.png"
import Image from "next/image"

export function EnvironmentVariablesSection() {
	const [isOpen, setIsOpen] = useState(false)
	const store = useMenuBuilderStore()
	const envs = store((state) => state.serviceEnvs)
	const updateEnvironmentVariables = store((state) => state.updateEnvironmentVariables)
	const retrySave = store((state) => state.retrySave)
	const clearSaveError = store((state) => state.clearSaveError)

	const handleUpdate = useCallback(
		(updatedEnvs: Record<string, string>) => {
			updateEnvironmentVariables(updatedEnvs)
		},
		[updateEnvironmentVariables]
	)

	const envCount = Object.keys(envs).length

	// Handle keyboard navigation for popover
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape" && isOpen) {
			setIsOpen(false)
		}
	}

	return (
		<section className="p-2" role="region" aria-labelledby="env-vars-heading">
			<div className="flex items-center justify-between mb-4">
				<h3 id="env-vars-heading" className="text-sm text-text-primary ml-3 font-bold">
					Environment Variables
				</h3>
				<Image
					src={HelpIcon}
					alt="Help information for environment variables"
					className="w-4.5 h-4.5"
					role="img"
				/>
			</div>

			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className="w-full justify-between h-auto p-3 bg-lineColor border-none shadow-none font-bold text-base"
						aria-expanded={isOpen}
						aria-haspopup="dialog"
						aria-describedby="env-vars-description"
						onKeyDown={handleKeyDown}
					>
						<div className="flex items-center gap-2">
							<Settings className="h-4 w-4" aria-hidden="true" />
							<span>Manage Variables</span>
						</div>
						{envCount > 0 && (
							<Badge
								variant="secondary"
								className="ml-2"
								aria-label={`${envCount} environment variable${
									envCount === 1 ? "" : "s"
								} configured`}
							>
								{envCount}
							</Badge>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="max-w-lg w-screen p-4"
					align="start"
					role="dialog"
					aria-labelledby="env-vars-heading"
					aria-describedby="env-vars-description"
					onKeyDown={handleKeyDown}
				>
					<div id="env-vars-description" className="sr-only">
						Manage environment variables for your service. Add, edit, or remove key-value pairs that
						will be available throughout your service configuration.
					</div>

					<div className="relative">
						<EnvironmentVariablesManager envs={envs} onUpdate={handleUpdate} />
					</div>
				</PopoverContent>
			</Popover>
		</section>
	)
}
