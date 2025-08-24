import React, { useState } from 'react'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { RegisterScreen } from '@/components/auth/RegisterScreen'
import { FarmerDashboard } from '@/components/dashboards/FarmerDashboard'
import { InvestorDashboard } from '@/components/dashboards/InvestorDashboard'
import { AdminDashboard } from '@/components/dashboards/AdminDashboard'
import { useAuth } from '@/lib/auth'

function App() {
  const { user, isLoading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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