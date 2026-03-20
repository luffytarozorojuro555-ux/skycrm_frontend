// import { jwtDecode } from 'jwt-decode'

// export const getToken = () => localStorage.getItem('token')
// export const setToken = (t) => localStorage.setItem('token', t)
// export const clearToken = () => localStorage.removeItem('token')

// export const getUserFromToken = () => {
//   const t = getToken()
//   if(!t) return null
//   try { return jwtDecode(t) } catch(e){ return null }
// }
import { jwtDecode } from 'jwt-decode'

export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

export const setToken = (t) => {
  if (!t) return;
  localStorage.setItem('token', t); // always store token
};

export const clearToken = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  localStorage.removeItem('rememberMe')
}

export const isRememberMe = () => localStorage.getItem('rememberMe') === 'true'

export const isRemembered = () => {
  return localStorage.getItem('rememberMe') === 'true';
};

export const setRememberMe = (remember, email = '') => {
  if (remember) {
    localStorage.setItem('rememberMe', 'true')
    if (email) localStorage.setItem('rememberedEmail', email)
  } else {
    localStorage.removeItem('rememberMe')
    localStorage.removeItem('rememberedEmail')
  }
}

export const getRememberedEmail = () => localStorage.getItem('rememberedEmail') || ''

export const getUserFromToken = () => {
  const t = getToken()
  if (!t) return null
  try {
    return jwtDecode(t)
  } catch (e) {
    return null
  }
}
