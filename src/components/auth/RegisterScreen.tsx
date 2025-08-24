import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sprout, User, Mail, Lock } from '@phosphor-icons/react'
import { useAuth, type UserRole } from '@/lib/auth'
import { toast } from 'sonner'

interface RegisterScreenProps {
  onSwitch: () => void
}

export function RegisterScreen({ onSwitch }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | ''
  })
  const { register, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    const result = await register(formData.email, formData.password, formData.role, formData.name)
    
    if (result.success) {
      toast.success('Account created successfully!')
    } else {
      toast.error(result.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 right-32 w-40 h-40 rounded-full bg-gradient-to-br from-secondary/30 to-transparent animate-bounce-gentle"></div>
        <div className="absolute bottom-32 left-32 w-56 h-56 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-bounce-gentle" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 left-16 w-24 h-24 rounded-full bg-gradient-to-br from-accent/30 to-transparent animate-bounce-gentle" style={{ animationDelay: '0.8s' }}></div>
      </div>

      <Card className="w-full max-w-md glass-effect shadow-xl animate-slide-up hover-lift relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center shadow-glow animate-scale-in">
            <Sprout size={32} className="text-secondary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-gradient mb-2">Join AgroFundConnect</CardTitle>
          <CardDescription className="text-base">
            Create an account to connect farmers with investors
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-floating">
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-12 h-12 border-2 transition-all duration-200 focus:border-secondary focus:shadow-glow bg-card/50 backdrop-blur-sm"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="form-floating">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-12 h-12 border-2 transition-all duration-200 focus:border-secondary focus:shadow-glow bg-card/50 backdrop-blur-sm"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Role</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="h-12 border-2 transition-all duration-200 focus:border-secondary bg-card/50 backdrop-blur-sm">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="glass-effect">
                  <SelectItem value="Farmer" className="hover:bg-primary/10 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      Farmer - Seeking Funding
                    </div>
                  </SelectItem>
                  <SelectItem value="Investor" className="hover:bg-accent/10 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      Investor - Providing Funding
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-floating">
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="pl-12 h-12 border-2 transition-all duration-200 focus:border-secondary focus:shadow-glow bg-card/50 backdrop-blur-sm"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-floating">
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-12 h-12 border-2 transition-all duration-200 focus:border-secondary focus:shadow-glow bg-card/50 backdrop-blur-sm"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 gradient-secondary text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitch}
                className="font-semibold text-secondary hover:text-secondary/80 transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}