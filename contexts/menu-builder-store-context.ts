import type { menuBuilderStore } from "@/store/menu-builder-store"
import { createContext } from "react"

export type MenuBuilderStoreContextType = typeof menuBuilderStore

export const MenuBuilderStoreContext = createContext<MenuBuilderStoreContextType | null>(null)
