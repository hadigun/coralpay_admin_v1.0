"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMenuBuilderStore } from "@/hooks/use-menu-builder-store"
import { Check, Loader2, Clock, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function formatTime(date: Date) {
	return `${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

function formatRelative(date: Date) {
	const diff = Date.now() - date.getTime()
	const s = Math.floor(diff / 1000)
	if (s < 60) return `${s}s ago`
	const m = Math.floor(s / 60)
	if (m < 60) return `${m}m ago`
	const h = Math.floor(m / 60)
	if (h < 24) return `${h}h ago`
	const d = Math.floor(h / 24)
	return `${d}d ago`
}

export function SaveStatus() {
	const store = useMenuBuilderStore()
	const isSaving = store((s) => s.isSaving)
	const changes = store((s) => s.changes)

	const [isOnline, setIsOnline] = useState<boolean>(
		typeof navigator !== "undefined" ? navigator.onLine : true
	)
	const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
	const prevIsSaving = useRef(isSaving)

	useEffect(() => {
		const handleOnline = () => setIsOnline(true)
		const handleOffline = () => setIsOnline(false)
		if (typeof window !== "undefined") {
			window.addEventListener("online", handleOnline)
			window.addEventListener("offline", handleOffline)
			return () => {
				window.removeEventListener("online", handleOnline)
				window.removeEventListener("offline", handleOffline)
			}
		}
	}, [])

	useEffect(() => {
		if (prevIsSaving.current && !isSaving && changes.length === 0) {
			setLastSavedAt(new Date())
		}
		prevIsSaving.current = isSaving
	}, [isSaving, changes.length])

	const queued = changes.length

	const state = useMemo(() => {
		if (!isOnline) return "offline" as const
		if (isSaving) return "saving" as const
		if (queued > 0) return "queued" as const
		return "saved" as const
	}, [isOnline, isSaving, queued])

	const icon =
		state === "offline" ? (
			<WifiOff className="h-3.5 w-3.5" />
		) : state === "saving" ? (
			<Loader2 className="h-3.5 w-3.5 animate-spin" />
		) : state === "queued" ? (
			<Clock className="h-3.5 w-3.5" />
		) : (
			<Check className="h-3.5 w-3.5" />
		)

	const label =
		state === "offline"
			? `Offline${queued ? ` • ${queued > 99 ? "99+" : queued}` : ""}`
			: state === "saving"
			? `Saving…${queued ? ` (${queued})` : ""}`
			: state === "queued"
			? `Queued ${queued > 99 ? "99+" : queued}`
			: `Saved${lastSavedAt ? ` • ${formatTime(lastSavedAt)}` : ""}`

	const tone =
		state === "offline"
			? "bg-red-50 text-red-700 border-red-200"
			: state === "saving"
			? "bg-primary/10 text-primary border-primary/20"
			: state === "queued"
			? "bg-amber-50 text-amber-700 border-amber-200"
			: "bg-emerald-50 text-emerald-700 border-emerald-200"

	return (
		<Popover>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Badge variant="outline" className={`cursor-pointer select-none ${tone}`}>
							{icon}
							<span className="tabular-nums">{label}</span>
						</Badge>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent sideOffset={6}>
					{state === "saved" && lastSavedAt ? (
						<span>Last saved {formatRelative(lastSavedAt)}</span>
					) : state === "queued" ? (
						<span>
							{queued} change{queued === 1 ? "" : "s"} pending
						</span>
					) : state === "saving" ? (
						<span>Saving changes…</span>
					) : (
						<span>You're offline. Changes will sync when online.</span>
					)}
				</TooltipContent>
			</Tooltip>

			<PopoverContent align="end" sideOffset={8} className="w-80">
				<div className="space-y-2">
					<div className="text-sm font-semibold">Autosave</div>
					<div className="text-xs text-muted-foreground">
						Changes are saved automatically after a short pause. You can keep editing.
					</div>

					<div className="mt-2 grid grid-cols-2 gap-2 text-xs">
						<div className="rounded-md border p-2 flex items-center gap-2">
							{icon}
							<div className="font-medium capitalize">{state}</div>
						</div>
						<div className="rounded-md border p-2">
							<div className="text-muted-foreground">Pending</div>
							<div className="font-semibold tabular-nums">{queued}</div>
						</div>
					</div>

					<div className="text-xs text-muted-foreground">
						{lastSavedAt ? (
							<>
								Last saved {formatRelative(lastSavedAt)} ({formatTime(lastSavedAt)})
							</>
						) : (
							<>No saved changes yet</>
						)}
					</div>

					{!isOnline && (
						<div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
							You're offline. Autosave will resume once you're back online.
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
