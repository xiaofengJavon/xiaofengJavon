import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AdminUser {
  id: string
  username: string
  role: string
  token: string
}

interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
}

const getStoredUser = (): AdminUser | null => {
  try {
    const stored = localStorage.getItem('admin_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const initialState: AuthState = {
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem('admin_token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AdminUser>) => {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem('admin_token', action.payload.token)
      localStorage.setItem('admin_user', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
