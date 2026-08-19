import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser(res.data)
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const refreshAccessToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token')
    if (!refresh_token) {
      throw new Error('No refresh token')
    }
    
    const res = await axios.post(`${API_URL}/auth/refresh`, { refresh_token })
    const { access_token, refresh_token: new_refresh_token } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('refresh_token', new_refresh_token)
    return access_token
  }

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const newToken = await refreshAccessToken()
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return axios(originalRequest)
          } catch (refreshError) {
            localStorage.removeItem('token')
            localStorage.removeItem('refresh_token')
            setUser(null)
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }
        return Promise.reject(error)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [])

  const login = async (username, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { username, password })
    const { access_token, refresh_token, user_type, user_id, name } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser({ user_type, user_id, name, username })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export { API_URL }
