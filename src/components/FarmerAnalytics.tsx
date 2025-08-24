import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendUp, 
  Users, 
  DollarSign, 
  Calendar,
  BarChart,
  PieChart
} from '@phosphor-icons/react'
import { useProjects, type Project } from '@/lib/projects'
import { useInvestments } from '@/lib/investments'
import { useAuth } from '@/lib/auth'

interface ProjectAnalytics {
  project: Project
  totalInvestors: number
  averageInvestment: number
  fundingVelocity: number // funding per day
  timeToGoal: number // estimated days to reach goal
  largestInvestment: number
  recentInvestments: Array<{ amount: number; date: string }>
}

export function FarmerAnalytics() {
  const { user } = useAuth()
  const { getProjectsByFarmer } = useProjects()
  const { investments } = useInvestments()
  
  if (!user) return null
  
  const farmerProjects = getProjectsByFarmer(user.id)
  
  const getProjectAnalytics = (project: Project): ProjectAnalytics => {
    const projectInvestments = investments.filter(inv => inv.projectId === project.id)
    
    const totalInvestors = new Set(projectInvestments.map(inv => inv.investorId)).size
    const averageInvestment = projectInvestments.length > 0 
      ? projectInvestments.reduce((sum, inv) => sum + inv.amount, 0) / projectInvestments.length 
      : 0
    
    // Calculate funding velocity (funding per day)
    const projectAge = Math.max(1, Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    const fundingVelocity = project.raisedAmount / projectAge
    
    // Estimate time to goal
    const remainingAmount = project.goalAmount - project.raisedAmount
    const timeToGoal = fundingVelocity > 0 ? Math.ceil(remainingAmount / fundingVelocity) : Infinity
    
    const largestInvestment = projectInvestments.length > 0 
      ? Math.max(...projectInvestments.map(inv => inv.amount))
      : 0
    
    const recentInvestments = projectInvestments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(inv => ({
        amount: inv.amount,
        date: new Date(inv.createdAt).toLocaleDateString()
      }))
    
    return {
      project,
      totalInvestors,
      averageInvestment,
      fundingVelocity,
      timeToGoal,
      largestInvestment,
      recentInvestments
    }
  }
  
  const projectAnalytics = farmerProjects.map(getProjectAnalytics)
  
  // Overall farmer statistics
  const totalRaised = farmerProjects.reduce((sum, project) => sum + project.raisedAmount, 0)
  const totalGoal = farmerProjects.reduce((sum, project) => sum + project.goalAmount, 0)
  const totalInvestors = new Set(
    investments
      .filter(inv => farmerProjects.some(p => p.id === inv.projectId))
      .map(inv => inv.investorId)
  ).size
  const averageProjectProgress = farmerProjects.length > 0 
    ? farmerProjects.reduce((sum, p) => sum + (p.raisedAmount / p.goalAmount), 0) / farmerProjects.length * 100
    : 0
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Funding Analytics</h2>
        <p className="text-muted-foreground">Track your project performance and investor engagement</p>
      </div>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRaised.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((totalRaised / totalGoal) * 100).toFixed(1)}% of total goal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvestors}</div>
            <p className="text-xs text-muted-foreground">
              Across {farmerProjects.length} projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProjectProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average project completion
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmerProjects.filter(p => p.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently seeking funding
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Project-by-Project Analytics */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Project Performance</h3>
        
        {projectAnalytics.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground text-center">
                Create your first project to see detailed analytics
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {projectAnalytics.map((analytics) => (
              <Card key={analytics.project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{analytics.project.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant={
                          analytics.project.status === 'approved' ? 'default' :
                          analytics.project.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {analytics.project.status}
                        </Badge>
                        <span>{analytics.project.category}</span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${analytics.project.raisedAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of ${analytics.project.goalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Funding Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {((analytics.project.raisedAmount / analytics.project.goalAmount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(analytics.project.raisedAmount / analytics.project.goalAmount) * 100} 
                      className="h-3"
                    />
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Investors</p>
                      <p className="text-xl font-bold">{analytics.totalInvestors}</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg Investment</p>
                      <p className="text-xl font-bold">${analytics.averageInvestment.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Daily Rate</p>
                      <p className="text-xl font-bold">${analytics.fundingVelocity.toFixed(0)}</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Est. Days to Goal</p>
                      <p className="text-xl font-bold">
                        {analytics.timeToGoal === Infinity ? '∞' : analytics.timeToGoal}
                      </p>
                    </div>
                  </div>
                  
                  {/* Recent Investment Activity */}
                  {analytics.recentInvestments.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Recent Investments</h4>
                      <div className="space-y-2">
                        {analytics.recentInvestments.map((investment, index) => (
                          <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm">{investment.date}</span>
                            </div>
                            <span className="font-medium">${investment.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Project Insights */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Project Insights</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {analytics.largestInvestment > 0 && (
                        <p>• Largest single investment: ${analytics.largestInvestment.toLocaleString()}</p>
                      )}
                      {analytics.totalInvestors > 0 && (
                        <p>• Average investor commits: ${(analytics.project.raisedAmount / analytics.totalInvestors).toLocaleString()}</p>
                      )}
                      {analytics.fundingVelocity > 0 && analytics.timeToGoal !== Infinity && (
                        <p>• At current rate, project will reach goal in {analytics.timeToGoal} days</p>
                      )}
                      {analytics.project.raisedAmount === 0 && analytics.project.status === 'approved' && (
                        <p>• Project is approved but hasn't received first investment yet</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}