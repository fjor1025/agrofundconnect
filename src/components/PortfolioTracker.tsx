import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendUp, 
  TrendDown, 
  DollarSign, 
  PieChart, 
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart
} from '@phosphor-icons/react'
import { useInvestmentPortfolio } from '@/lib/investments'
import { useInvestments } from '@/lib/investments'
import { useAuth } from '@/lib/auth'

export function PortfolioTracker() {
  const { user } = useAuth()
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M')
  
  if (!user) return null
  
  // For demo purposes, use 'demo_investor_1' if user has no investments
  const { getInvestmentsByInvestor } = useInvestments()
  const userInvestments = getInvestmentsByInvestor(user.id)
  const demoInvestments = getInvestmentsByInvestor('demo_investor_1')
  
  // Use user investments if they exist, otherwise fall back to demo data
  const effectiveUserId = userInvestments.length > 0 ? user.id : 'demo_investor_1'
  
  const {
    getPortfolioMetrics,
    getInvestmentHistory,
    getPortfolioBreakdown,
    getPerformanceMetrics
  } = useInvestmentPortfolio(effectiveUserId)
  
  const metrics = getPortfolioMetrics()
  const history = getInvestmentHistory()
  const breakdown = getPortfolioBreakdown()
  const performance = getPerformanceMetrics()
  
  const handleExportData = () => {
    const exportData = {
      portfolioMetrics: metrics,
      investmentHistory: history,
      portfolioBreakdown: breakdown,
      performanceMetrics: performance,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-${user.login}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
          <p className="text-muted-foreground">Track your agricultural investments and performance</p>
        </div>
        <Button onClick={handleExportData} variant="outline" className="gap-2">
          <Download size={16} />
          Export Data
        </Button>
      </div>
      
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.totalActiveProjects} projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalPortfolioValue.toLocaleString()}</div>
            <p className="text-xs text-primary">
              +${metrics.projectedReturns.toLocaleString()} projected returns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Investment</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageInvestmentSize.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per project investment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.riskScore * 10).toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.riskScore < 0.3 ? 'Low Risk' : metrics.riskScore < 0.7 ? 'Medium Risk' : 'High Risk'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Investment History</TabsTrigger>
          <TabsTrigger value="breakdown">Portfolio Breakdown</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Investments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Investments</CardTitle>
                <CardDescription>Your latest investment activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.slice(0, 5).map((item) => (
                    <div key={item.investment.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {item.status === 'completed' && <CheckCircle size={16} className="text-primary" />}
                          {item.status === 'active' && <Clock size={16} className="text-accent" />}
                          {item.status === 'at_risk' && <AlertTriangle size={16} className="text-destructive" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.investment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.investment.amount.toLocaleString()}</p>
                        <p className={`text-xs ${item.expectedReturn >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {item.expectedReturn >= 0 ? '+' : ''}${item.expectedReturn.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Portfolio Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
                <CardDescription>Investment breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(breakdown.byCategory)
                    .sort(([,a], [,b]) => b.amount - a.amount)
                    .slice(0, 5)
                    .map(([category, data]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span>${data.amount.toLocaleString()} ({data.percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={data.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Investment History</CardTitle>
              <CardDescription>Detailed view of all your investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.investment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.project.title}</h4>
                          <Badge variant={
                            item.status === 'completed' ? 'default' :
                            item.status === 'active' ? 'secondary' : 'destructive'
                          }>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.project.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Invested on {new Date(item.investment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-lg">${item.investment.amount.toLocaleString()}</p>
                        <p className={`text-sm ${item.expectedReturn >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          Current: ${item.currentValue.toLocaleString()}
                        </p>
                        <p className={`text-xs ${item.expectedReturn >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {item.expectedReturn >= 0 ? '+' : ''}${item.expectedReturn.toLocaleString()} return
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Time in Market</p>
                        <p className="font-medium">{item.timeInMarket} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Project Progress</p>
                        <p className="font-medium">
                          {((item.project.raisedAmount / item.project.goalAmount) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROI</p>
                        <p className={`font-medium ${item.expectedReturn >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {((item.expectedReturn / item.investment.amount) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <Progress 
                      value={(item.project.raisedAmount / item.project.goalAmount) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* By Category */}
            <Card>
              <CardHeader>
                <CardTitle>By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(breakdown.byCategory)
                    .sort(([,a], [,b]) => b.amount - a.amount)
                    .map(([category, data]) => (
                    <div key={category} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{category}</p>
                        <p className="text-xs text-muted-foreground">{data.count} projects</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${data.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* By Risk Level */}
            <Card>
              <CardHeader>
                <CardTitle>By Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(breakdown.byRiskLevel)
                    .sort(([,a], [,b]) => b.amount - a.amount)
                    .map(([level, data]) => (
                    <div key={level} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{level} Risk</p>
                        <p className="text-xs text-muted-foreground">{data.count} projects</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${data.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* By Funding Stage */}
            <Card>
              <CardHeader>
                <CardTitle>By Funding Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(breakdown.byFundingStage)
                    .sort(([,a], [,b]) => b.amount - a.amount)
                    .map(([stage, data]) => (
                    <div key={stage} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{stage}</p>
                        <p className="text-xs text-muted-foreground">{data.count} projects</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${data.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Investment Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Investment Trend</CardTitle>
                <CardDescription>Your investment activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performance.monthlyInvestments.slice(-6).map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{month.month}</span>
                        <span>${month.amount.toLocaleString()} ({month.count} investments)</span>
                      </div>
                      <Progress 
                        value={(month.amount / Math.max(...performance.monthlyInvestments.map(m => m.amount))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Top Performing Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Investments</CardTitle>
                <CardDescription>Your best performing projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performance.topPerformingProjects.slice(0, 5).map((item, index) => (
                    <div key={item.investment.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.investment.amount.toLocaleString()} invested
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">+{item.performance.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">ROI</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Portfolio Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Growth Over Time</CardTitle>
              <CardDescription>Track your portfolio value progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.portfolioGrowth.slice(-10).map((point, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="text-sm">{point.date}</span>
                    <div className="text-right">
                      <p className="font-medium">${point.totalValue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Invested: ${point.totalInvested.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}