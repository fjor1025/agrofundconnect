import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sprout, Mail, Lock } from '@phosphor-icons/react'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'

interface LoginScreenProps {
  onSwitch: () => void
}

export function LoginScreen({ onSwitch }: LoginScreenProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      toast.success('Welcome back!')
    } else {
      toast.error(result.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-bounce-gentle"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-accent/20 to-transparent animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-transparent animate-bounce-gentle" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Card className="w-full max-w-md glass-effect shadow-xl animate-slide-up hover-lift relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-scale-in">
            <Sprout size={32} className="text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-gradient mb-2">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in to your AgroFundConnect account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-floating">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-12 h-12 border-2 transition-all duration-200 focus:border-primary focus:shadow-glow bg-card/50 backdrop-blur-sm"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-floating">
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-12 h-12 border-2 transition-all duration-200 focus:border-primary focus:shadow-glow bg-card/50 backdrop-blur-sm"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 btn-primary text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitch}
                className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
              >
                Create account
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}