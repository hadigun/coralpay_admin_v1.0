import { MenuBuilderStoreContext } from "@/contexts/menu-builder-store-context"
import { use } from "react"

export function useMenuBuilderStore() {
	const context = use(MenuBuilderStoreContext)
	if (!context) {
		throw new Error("useMenuBuilderStore must be used within a MenuBuilderStoreProvider")
	}
	return context
}
