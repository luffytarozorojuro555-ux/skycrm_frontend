import axios from 'axios'
import { getToken, clearToken } from '../utils/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use(cfg => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
})

api.interceptors.response.use(
  res => res,
  err => {
    const token = getToken();

    if (
      err?.response?.status === 401 &&
      token &&
      window.location.pathname !== '/login/select'
    ) {
      clearToken();
      window.location.href = '/login/select';
    }

    return Promise.reject(err);
  }
);

export default api;
