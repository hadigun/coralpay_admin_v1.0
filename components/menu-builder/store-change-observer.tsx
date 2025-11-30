import { useEffect } from "react"
import { useMenuBuilderStore } from "@/hooks/use-menu-builder-store"

export function StoreChangeObserver() {
	const store = useMenuBuilderStore()
	const changes = store((s) => s.changes)
	const save = store((s) => s.save)

	useEffect(() => {
		save()
	}, [changes])

	return null
}
