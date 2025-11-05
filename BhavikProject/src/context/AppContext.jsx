import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }

    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Sync language changes with i18n
  useEffect(() => {
    // Import i18n dynamically to avoid circular dependency
    import('../i18n').then((i18nModule) => {
      const i18n = i18nModule.default
      if (i18n.language !== language) {
        i18n.changeLanguage(language)
      }
    })
  }, [language])

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // Alias for compatibility with ThemeToggle component
  const setThemeAlias = (newTheme) => {
    setTheme(newTheme)
  }

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  // Alias for compatibility with LanguageSelector component
  const setLanguageAlias = (newLanguage) => {
    changeLanguage(newLanguage)
  }

  const addNotification = (notification) => {
    const id = Date.now()
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    }
    
    setNotifications(prev => [...prev, newNotification])

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const showSuccess = (message, options = {}) => {
    addNotification({
      type: 'success',
      message,
      ...options
    })
  }

  const showError = (message, options = {}) => {
    addNotification({
      type: 'error',
      message,
      duration: 8000, // Longer duration for errors
      ...options
    })
  }

  const showWarning = (message, options = {}) => {
    addNotification({
      type: 'warning',
      message,
      ...options
    })
  }

  const showInfo = (message, options = {}) => {
    addNotification({
      type: 'info',
      message,
      ...options
    })
  }

  const value = {
    // Theme
    theme,
    toggleTheme,
    setTheme: setThemeAlias, // For compatibility
    
    // Language
    language,
    changeLanguage,
    setLanguage: setLanguageAlias, // For compatibility
    
    // Loading
    loading,
    setLoading,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}