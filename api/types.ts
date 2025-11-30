export type ApiSuccessResponse<T = undefined> = {
	success: true
	message: string
	data: T
}

export type ApiErrorResponse = {
	success: false
	message: string
	error: string
}

export type ApiPaginatedSuccessResponse<T> = {
	success: true
	message: string
	data: Array<T>
	pagination: {
		total: number
		limit: number
		pages: number
		page: number
		hasMore: boolean
	}
}
