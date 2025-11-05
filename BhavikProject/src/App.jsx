import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import NotificationSystem from './components/NotificationSystem'
import LoadingSpinner from './components/LoadingSpinner'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Animals from './pages/Animals'
import Land from './pages/Land'
import HealthMonitor from './pages/HealthMonitor'
import VoicePredict from './pages/VoicePredict'
import Vets from './pages/Vets'
import KnowledgeBase from './pages/KnowledgeBase'
import Schemes from './pages/Schemes'
import Profile from './pages/Profile'
import Reports from './pages/Reports'

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/animals" element={<Animals />} />
              <Route path="/land" element={<Land />} />
              <Route path="/health" element={<HealthMonitor />} />
              <Route path="/voice" element={<VoicePredict />} />
              <Route path="/vets" element={<Vets />} />
              <Route path="/knowledge" element={<KnowledgeBase />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <NotificationSystem />
        </div>
      </AuthProvider>
    </AppProvider>
  )
}