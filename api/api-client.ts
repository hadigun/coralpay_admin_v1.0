import axios from "axios"

const API_ACCESS_TOKEN =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoib3duZXJAc3lzdGVtLmNvbSIsImlkIjoiZTViNzUwOWEtNjRjMS00MzZhLTg5ZjktNzFmZjM5OThkMzZlIiwic2Vzc2lvbklkIjoiNzcwMDY1ODMtODVhMS00Y2IwLTllNDYtYjZmOTEzOGFiYzIyIiwicm9sZUlkIjoiNjc1NjhkMWEtYzFkOC00YzQzLTkxOTMtMTcwMmM4ODhlNTIzIn0sInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjAxOTU1MzUsImV4cCI6MTc2MDE5OTEzNX0.mEP7fY-e-ukNEj1u9TcJ9w5ODFACrUDP26qVpOcy-us"

export const apiClient = axios.create({
	baseURL: "http://localhost:3000/api/v1",
	headers: {
		Authorization: `Bearer ${API_ACCESS_TOKEN}`,
		"Content-Type": "application/json",
	},
})

apiClient.interceptors.request.use((config) => {
	return config
})

apiClient.interceptors.response.use((response) => {
	return response
})
