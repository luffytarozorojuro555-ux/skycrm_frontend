import axios from 'axios'
import { getToken, clearToken } from '../utils/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL //|| "https://skycrm-backend.onrender.com/api"
})

api.interceptors.request.use(cfg => {
  const t = getToken()
  if(t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if(err.response && err.response.status === 401){
      clearToken()
      window.location.href = '/login/select'
    }
    return Promise.reject(err)
  }
)

export default api
