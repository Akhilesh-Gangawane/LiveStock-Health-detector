import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, db } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        setIsAuthenticated(true)
        await loadUserProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          setIsAuthenticated(true)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setIsAuthenticated(false)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await db.profiles.get(userId)
      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error loading profile:', error)
        return
      }
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            phone: userData.phone,
            farm_name: userData.farmName
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Create profile after successful registration
      if (data.user) {
        const profileData = {
          id: data.user.id,
          full_name: userData.name,
          email: userData.email,
          phone: userData.phone,
          farm_name: userData.farmName,
          role: 'farmer',
          created_at: new Date().toISOString()
        }

        const { error: profileError } = await db.profiles.create(profileData)
        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return { 
        success: true, 
        user: data.user,
        message: 'Registration successful! Please check your email to verify your account.'
      }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updatedData) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' }
      }

      const { data, error } = await db.profiles.update(user.id, updatedData)
      
      if (error) {
        return { success: false, error: error.message }
      }

      setProfile(data[0])
      return { success: true, profile: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    loadUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}