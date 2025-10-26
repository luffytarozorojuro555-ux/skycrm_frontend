import { jwtDecode } from 'jwt-decode'

export const getToken = () => localStorage.getItem('token')
export const setToken = (t) => localStorage.setItem('token', t)
export const clearToken = () => localStorage.removeItem('token')

export const getUserFromToken = () => {
  const t = getToken()
  if(!t) return null
  try { return jwtDecode(t) } catch(e){ return null }
}
