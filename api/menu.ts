import type { AxiosResponse } from "axios"
import { apiClient } from "./api-client"
import type { MenuService, MenuServiceChange } from "@mobiresoft-coral/ussd-shared-core"
import type { ApiSuccessResponse } from "./types"

export async function getEntireService(
	merchantId: string,
	serviceId: string
): Promise<AxiosResponse<ApiSuccessResponse<MenuService>>> {
	return apiClient.get(`/merchants/${merchantId}/menu-services/${serviceId}`, {})
}

export async function applyServiceChanges(
	merchantId: string,
	serviceId: string,
	changes: Array<MenuServiceChange>
): Promise<AxiosResponse<ApiSuccessResponse<void>>> {
	return apiClient.post(`/merchants/${merchantId}/menu-services/${serviceId}/changes`, changes)
}
