import axios, {
  type AxiosInstance,
  type AxiosResponse,
} from "axios"

// Create Axios instance with default config
export const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 50000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Handle common errors here (e.g., 401 Unauthorized, 403 Forbidden)
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data)
    } else if (error.request) {
      console.error("Network Error:", error.request)
    } else {
      console.error("Error:", error.message)
    }
    return Promise.reject(error)
  }
)

export default api
