"use client"
import ErrorBoundary from "@/components/common/error-boundary"
import { QuickAction } from "@/components/menu-builder/quick-action"
import { SaveStatus } from "@/components/menu-builder/save-status"
import { SceneControls } from "@/components/menu-builder/scene-control"
import { StoreChangeObserver } from "@/components/menu-builder/store-change-observer"
import { MenuBuilderStoreProvider } from "@/components/menu-builder/store-provider"
import { ToolsPanel } from "@/components/menu-builder/tools-panel"
import { MenuBuilderWorkspace } from "@/components/menu-builder/workspace"
import { EmulatorPanel } from "@/components/simulator/panel"
import "@xyflow/react/dist/style.css"
import { useParams } from "next/navigation"

const EditServicePage = () => {
	const { merchantId, serviceId } = useParams()
  
	return (
		<ErrorBoundary>
			<MenuBuilderStoreProvider
				merchantId="a61b057a-e23b-4640-9444-6ac8fdc6d45f"
				serviceId="c42a3f61-1e1b-4baf-a780-f79181c300a6"
			>
				<StoreChangeObserver />
				<div className="relative h-dvh flex">
					<div className="flex-1">
						<MenuBuilderWorkspace />
					</div>
					<div className="absolute top-0 right-0 p-4 flex items-center gap-4">
						<SaveStatus />
						<QuickAction />
					</div>
					<div className="absolute bottom-0 right-4 p-4">
						<SceneControls />
					</div>
					<div className="absolute top-0 left-0 h-full p-4">
						<ToolsPanel />
					</div>
					<EmulatorPanel />
				</div>
			</MenuBuilderStoreProvider>
		</ErrorBoundary>
	)
}

export default EditServicePage
