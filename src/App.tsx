import React, { useState, useEffect } from 'react'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { RegisterScreen } from '@/components/auth/RegisterScreen'
import { FarmerDashboard } from '@/components/dashboards/FarmerDashboard'
import { InvestorDashboard } from '@/components/dashboards/InvestorDashboard'
import { AdminDashboard } from '@/components/dashboards/AdminDashboard'
import { useAuth, initializeDefaultAdmin } from '@/lib/auth'

function App() {
  const { user, isLoading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    initializeDefaultAdmin()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-12 h-12 border-2 border-accent/20 rounded-full animate-ping mx-auto"></div>
          </div>
          <p className="text-muted-foreground text-lg font-medium">Connecting to AgroFund...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-gentle"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-gentle" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-gentle" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        {showRegister ? (
          <RegisterScreen onSwitch={() => setShowRegister(false)} />
        ) : (
          <LoginScreen onSwitch={() => setShowRegister(true)} />
        )}
      </>
    )
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'Farmer':
        return <FarmerDashboard />
      case 'Investor':
        return <InvestorDashboard />
      case 'Admin':
        return <AdminDashboard />
      default:
        return <div>Unknown role</div>
    }
  }

  return (
    <>
      {renderDashboard()}
    </>
  )
}

export default App