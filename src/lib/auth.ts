import { useKV } from '@github/spark/hooks'

export type UserRole = 'Farmer' | 'Investor' | 'Admin'

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null)
  const [isLoading, setIsLoading] = useKV('auth-loading', false)

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      const users = await spark.kv.get<User[]>('users') || []
      const user = users.find(u => u.email === email)
      
      if (!user) {
        return { success: false, error: 'User not found' }
      }
      
      const passwords = await spark.kv.get<Record<string, string>>('passwords') || {}
      if (passwords[user.id] !== password) {
        return { success: false, error: 'Invalid password' }
      }
      
      setCurrentUser(user)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, role: UserRole, name?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      const users = await spark.kv.get<User[]>('users') || []
      
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'Email already registered' }
      }
      
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        role,
        name
      }
      
      const updatedUsers = [...users, newUser]
      await spark.kv.set('users', updatedUsers)
      
      const passwords = await spark.kv.get<Record<string, string>>('passwords') || {}
      passwords[newUser.id] = password
      await spark.kv.set('passwords', passwords)
      
      setCurrentUser(newUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Registration failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setCurrentUser(null)
  }

  return {
    user: currentUser,
    isLoading,
    login,
    register,
    logout
  }
}