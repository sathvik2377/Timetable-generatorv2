import React from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'faculty' | 'student'
  phone_number?: string
  employee_id?: string
  student_id?: string
  preferred_theme: 'light' | 'dark'
  full_name: string
  display_name: string
  is_active: boolean
  date_joined: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface JWTPayload {
  user_id: number
  username: string
  email: string
  role: string
  exp: number
  iat: number
}

class AuthService {
  private static instance: AuthService
  private user: User | null = null

  private constructor() {
    this.loadUserFromStorage()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private loadUserFromStorage(): void {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          this.user = JSON.parse(userData)
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error)
          this.clearAuth()
        }
      }
    }
  }

  public getAccessToken(): string | null {
    return Cookies.get('access_token') || null
  }

  public getRefreshToken(): string | null {
    return Cookies.get('refresh_token') || null
  }

  public isAuthenticated(): boolean {
    const token = this.getAccessToken()
    if (!token) return false

    try {
      const decoded = jwtDecode<JWTPayload>(token)
      return decoded.exp > Date.now() / 1000
    } catch (error) {
      return false
    }
  }

  public getUser(): User | null {
    return this.user
  }

  public getUserRole(): string | null {
    return this.user?.role || null
  }

  public hasRole(requiredRoles: string[]): boolean {
    const userRole = this.getUserRole()
    return userRole ? requiredRoles.includes(userRole) : false
  }

  public isAdmin(): boolean {
    return this.getUserRole() === 'admin'
  }

  public isFaculty(): boolean {
    return this.getUserRole() === 'faculty'
  }

  public isStudent(): boolean {
    return this.getUserRole() === 'student'
  }

  public setAuth(user: User, tokens: AuthTokens): void {
    this.user = user
    
    // Store tokens in cookies
    Cookies.set('access_token', tokens.access, { expires: 1 }) // 1 day
    Cookies.set('refresh_token', tokens.refresh, { expires: 7 }) // 7 days
    
    // Store user data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  public clearAuth(): void {
    this.user = null
    
    // Clear cookies
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }

  public async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        Cookies.set('access_token', data.access, { expires: 1 })
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    return false
  }

  public getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  public async logout(): Promise<void> {
    // Optionally call logout endpoint
    try {
      const refreshToken = this.getRefreshToken()
      if (refreshToken) {
        await fetch('http://localhost:8000/api/auth/token/blacklist/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
          },
          body: JSON.stringify({ refresh: refreshToken }),
        })
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    }

    this.clearAuth()
  }

  public canAccessRoute(pathname: string): boolean {
    const routePermissions: Record<string, string[]> = {
      '/dashboard/admin': ['admin'],
      '/dashboard/faculty': ['admin', 'faculty'],
      '/dashboard/student': ['admin', 'faculty', 'student'],
      '/users': ['admin'],
      '/analytics': ['admin', 'faculty'],
      '/setup-wizard': ['admin'],
    }

    const requiredRoles = routePermissions[pathname]
    if (!requiredRoles) return true // Public route

    return this.hasRole(requiredRoles)
  }
}

export const authService = AuthService.getInstance()

// Create a React context for authentication
const AuthContext = React.createContext<{
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isFaculty: boolean
  isStudent: boolean
  hasRole: (roles: string[]) => boolean
  canAccessRoute: (pathname: string) => boolean
  logout: () => Promise<void>
  getAuthHeaders: () => Record<string, string>
  refreshAuth: () => void
} | null>(null)

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = React.useState({
    user: null as User | null,
    isAuthenticated: false,
  })

  const refreshAuth = React.useCallback(() => {
    const user = authService.getUser()
    const isAuthenticated = authService.isAuthenticated()
    setAuthState({ user, isAuthenticated })
  }, [])

  React.useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  const contextValue = React.useMemo(() => ({
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isAdmin: authState.user?.role === 'admin',
    isFaculty: authState.user?.role === 'faculty',
    isStudent: authState.user?.role === 'student',
    hasRole: (roles: string[]) => authState.user?.role ? roles.includes(authState.user.role) : false,
    canAccessRoute: (pathname: string) => authService.canAccessRoute(pathname),
    logout: async () => {
      await authService.logout()
      setAuthState({ user: null, isAuthenticated: false })
    },
    getAuthHeaders: () => authService.getAuthHeaders(),
    refreshAuth,
  }), [authState, refreshAuth])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// React hook for using auth in components
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Route guard component
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthGuardedComponent(props: P) {
    const [isLoading, setIsLoading] = React.useState(true)
    const [authState, setAuthState] = React.useState({
      isAuthenticated: false,
      user: null as User | null,
    })

    React.useEffect(() => {
      // Check authentication on component mount
      const checkAuth = () => {
        const isAuth = authService.isAuthenticated()
        const user = authService.getUser()

        setAuthState({
          isAuthenticated: isAuth,
          user: user,
        })
        setIsLoading(false)
      }

      checkAuth()
    }, [])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      )
    }

    if (!authState.isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return null
    }

    if (requiredRoles && authState.user && !requiredRoles.includes(authState.user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
            <button
              onClick={() => window.history.back()}
              className="glass-button px-6 py-2"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}
