import { ReactFlowProvider } from "@xyflow/react"
import { menuBuilderStore } from "@/store/menu-builder-store"
import { MenuBuilderStoreContext } from "@/contexts/menu-builder-store-context"
import { useEffect } from "react"
import { useFetchEntireService } from "@/hooks/api/menu/queries"
import { transformServiceToNodesAndEdges } from "@/lib/transformers"
import { generateEdges } from "@/lib/edge-generator"
import { LoadingScreen } from "@/components/common/loading-screen"

interface MenuBuilderStoreProviderInnerProps {
	children?: React.ReactNode
	merchantId: string
	serviceId: string
}

function MenuBuilderProviderInner({
	children,
	merchantId,
	serviceId,
}: MenuBuilderStoreProviderInnerProps) {
	const store = menuBuilderStore

	const setNodes = store((s) => s.setNodes)
	const setEdges = store((s) => s.setEdges)
	const setMerchantAndService = store((s) => s.setMerchantAndService)
	const setEnvironmentVariables = store((s) => s.setEnvironmentVariables)

	const nodes = store((s) => s.nodes)

	const { data: service, isLoading } = useFetchEntireService(merchantId, serviceId)

	useEffect(() => {
		setMerchantAndService(merchantId, serviceId)
	}, [merchantId, serviceId, setMerchantAndService])

	useEffect(() => {
		if (service?.data?.data) {
			const { nodes } = transformServiceToNodesAndEdges(service.data.data)
			setNodes(nodes)

			// Initialize environment variables from service metadata
			// Handle backward compatibility - if envs doesn't exist, use empty object
			const envs = (service.data.data as any)?.envs || {}
			setEnvironmentVariables(envs)
		}
	}, [service, setNodes, setEnvironmentVariables])

	// todo: we can optimize this further by only updating edges when a router plugin or directRoute is added/removed/updated
	useEffect(() => {
		const edges = generateEdges(nodes)
		setEdges(edges)
	}, [nodes, setEdges])

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<MenuBuilderStoreContext.Provider value={store}>{children}</MenuBuilderStoreContext.Provider>
	)
}

interface MenuBuilderStoreProviderProps {
	children?: React.ReactNode
	merchantId: string
	serviceId: string
}

export function MenuBuilderStoreProvider({
	children,
	merchantId,
	serviceId,
}: MenuBuilderStoreProviderProps) {
	return (
		<ReactFlowProvider>
			<MenuBuilderProviderInner merchantId={merchantId} serviceId={serviceId}>
				{children}
			</MenuBuilderProviderInner>
		</ReactFlowProvider>
	)
}
