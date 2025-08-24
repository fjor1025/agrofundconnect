import { useKV } from '@github/spark/hooks'
import { useProjects, type Project, type Investment } from './projects'

export interface PortfolioMetrics {
  totalInvested: number
  totalActiveProjects: number
  averageInvestmentSize: number
  totalPortfolioValue: number
  projectedReturns: number
  riskScore: number
}

export interface InvestmentHistory {
  investment: Investment
  project: Project
  status: 'active' | 'completed' | 'at_risk'
  currentValue: number
  expectedReturn: number
  timeInMarket: number // days
}

export interface PortfolioBreakdown {
  byCategory: Record<string, { amount: number; count: number; percentage: number }>
  byRiskLevel: Record<string, { amount: number; count: number; percentage: number }>
  byFundingStage: Record<string, { amount: number; count: number; percentage: number }>
}

export interface PerformanceMetrics {
  monthlyInvestments: Array<{ month: string; amount: number; count: number }>
  topPerformingProjects: Array<{ project: Project; investment: Investment; performance: number }>
  portfolioGrowth: Array<{ date: string; totalValue: number; totalInvested: number }>
}

export function useInvestmentPortfolio(investorId: string) {
  const { getInvestmentsByInvestor } = useInvestments()
  const { projects } = useProjects()
  
  const userInvestments = getInvestmentsByInvestor(investorId)
  
  const getPortfolioMetrics = (): PortfolioMetrics => {
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0)
    const activeProjects = new Set(userInvestments.map(inv => inv.projectId)).size
    const averageInvestmentSize = totalInvested / (userInvestments.length || 1)
    
    // Calculate portfolio value with simulated growth
    const totalPortfolioValue = userInvestments.reduce((sum, inv) => {
      const project = projects.find(p => p.id === inv.projectId)
      if (!project) return sum
      
      // Simulate portfolio growth based on project completion percentage
      const completionRate = project.raisedAmount / project.goalAmount
      const timeMultiplier = getDaysFromCreation(inv.createdAt) / 365 // Years since investment
      const growthFactor = 1 + (completionRate * 0.15) + (timeMultiplier * 0.08) // 15% completion bonus + 8% annual growth
      
      return sum + (inv.amount * growthFactor)
    }, 0)
    
    const projectedReturns = totalPortfolioValue - totalInvested
    const riskScore = calculateRiskScore(userInvestments, projects)
    
    return {
      totalInvested,
      totalActiveProjects: activeProjects,
      averageInvestmentSize,
      totalPortfolioValue,
      projectedReturns,
      riskScore
    }
  }
  
  const getInvestmentHistory = (): InvestmentHistory[] => {
    return userInvestments.map(investment => {
      const project = projects.find(p => p.id === investment.projectId)
      if (!project) {
        return {
          investment,
          project: {} as Project,
          status: 'at_risk' as const,
          currentValue: 0,
          expectedReturn: 0,
          timeInMarket: 0
        }
      }
      
      const timeInMarket = getDaysFromCreation(investment.createdAt)
      const completionRate = project.raisedAmount / project.goalAmount
      const status = getProjectStatus(project, completionRate)
      
      // Calculate current value and expected returns
      const growthFactor = 1 + (completionRate * 0.15) + (timeInMarket / 365 * 0.08)
      const currentValue = investment.amount * growthFactor
      const expectedReturn = currentValue - investment.amount
      
      return {
        investment,
        project,
        status,
        currentValue,
        expectedReturn,
        timeInMarket
      }
    }).sort((a, b) => new Date(b.investment.createdAt).getTime() - new Date(a.investment.createdAt).getTime())
  }
  
  const getPortfolioBreakdown = (): PortfolioBreakdown => {
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0)
    
    // By Category
    const byCategory: Record<string, { amount: number; count: number; percentage: number }> = {}
    const byCategoryRaw: Record<string, { amount: number; count: number }> = {}
    
    userInvestments.forEach(inv => {
      const project = projects.find(p => p.id === inv.projectId)
      const category = project?.category || 'Unknown'
      
      if (!byCategoryRaw[category]) {
        byCategoryRaw[category] = { amount: 0, count: 0 }
      }
      byCategoryRaw[category].amount += inv.amount
      byCategoryRaw[category].count += 1
    })
    
    Object.entries(byCategoryRaw).forEach(([category, data]) => {
      byCategory[category] = {
        ...data,
        percentage: (data.amount / totalInvested) * 100
      }
    })
    
    // By Risk Level
    const byRiskLevel: Record<string, { amount: number; count: number; percentage: number }> = {}
    const byRiskLevelRaw: Record<string, { amount: number; count: number }> = {}
    
    userInvestments.forEach(inv => {
      const project = projects.find(p => p.id === inv.projectId)
      const riskLevel = calculateProjectRisk(project)
      
      if (!byRiskLevelRaw[riskLevel]) {
        byRiskLevelRaw[riskLevel] = { amount: 0, count: 0 }
      }
      byRiskLevelRaw[riskLevel].amount += inv.amount
      byRiskLevelRaw[riskLevel].count += 1
    })
    
    Object.entries(byRiskLevelRaw).forEach(([level, data]) => {
      byRiskLevel[level] = {
        ...data,
        percentage: (data.amount / totalInvested) * 100
      }
    })
    
    // By Funding Stage
    const byFundingStage: Record<string, { amount: number; count: number; percentage: number }> = {}
    const byFundingStageRaw: Record<string, { amount: number; count: number }> = {}
    
    userInvestments.forEach(inv => {
      const project = projects.find(p => p.id === inv.projectId)
      const stage = getFundingStage(project)
      
      if (!byFundingStageRaw[stage]) {
        byFundingStageRaw[stage] = { amount: 0, count: 0 }
      }
      byFundingStageRaw[stage].amount += inv.amount
      byFundingStageRaw[stage].count += 1
    })
    
    Object.entries(byFundingStageRaw).forEach(([stage, data]) => {
      byFundingStage[stage] = {
        ...data,
        percentage: (data.amount / totalInvested) * 100
      }
    })
    
    return {
      byCategory,
      byRiskLevel,
      byFundingStage
    }
  }
  
  const getPerformanceMetrics = (): PerformanceMetrics => {
    // Monthly investments
    const monthlyData: Record<string, { amount: number; count: number }> = {}
    
    userInvestments.forEach(inv => {
      const month = new Date(inv.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      if (!monthlyData[month]) {
        monthlyData[month] = { amount: 0, count: 0 }
      }
      monthlyData[month].amount += inv.amount
      monthlyData[month].count += 1
    })
    
    const monthlyInvestments = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    
    // Top performing projects
    const topPerformingProjects = getInvestmentHistory()
      .filter(history => history.expectedReturn > 0)
      .sort((a, b) => b.expectedReturn - a.expectedReturn)
      .slice(0, 5)
      .map(history => ({
        project: history.project,
        investment: history.investment,
        performance: (history.expectedReturn / history.investment.amount) * 100
      }))
    
    // Portfolio growth over time
    const sortedInvestments = [...userInvestments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    
    let runningInvested = 0
    const portfolioGrowth = sortedInvestments.map(inv => {
      runningInvested += inv.amount
      const date = new Date(inv.createdAt).toLocaleDateString()
      
      // Calculate total value at this point in time
      const totalValue = sortedInvestments
        .filter(i => new Date(i.createdAt) <= new Date(inv.createdAt))
        .reduce((sum, investment) => {
          const project = projects.find(p => p.id === investment.projectId)
          if (!project) return sum
          
          const timeInMarket = getDaysFromCreation(investment.createdAt)
          const completionRate = project.raisedAmount / project.goalAmount
          const growthFactor = 1 + (completionRate * 0.15) + (timeInMarket / 365 * 0.08)
          
          return sum + (investment.amount * growthFactor)
        }, 0)
      
      return {
        date,
        totalValue,
        totalInvested: runningInvested
      }
    })
    
    return {
      monthlyInvestments,
      topPerformingProjects,
      portfolioGrowth
    }
  }
  
  return {
    getPortfolioMetrics,
    getInvestmentHistory,
    getPortfolioBreakdown,
    getPerformanceMetrics
  }
}

// Helper functions
function getDaysFromCreation(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
}

function getProjectStatus(project: Project, completionRate: number): 'active' | 'completed' | 'at_risk' {
  if (completionRate >= 1) return 'completed'
  if (completionRate >= 0.8) return 'active'
  
  // Consider projects at risk if they're older than 6 months and less than 50% funded
  const ageInDays = getDaysFromCreation(project.createdAt)
  if (ageInDays > 180 && completionRate < 0.5) return 'at_risk'
  
  return 'active'
}

function calculateRiskScore(investments: Investment[], projects: Project[]): number {
  if (investments.length === 0) return 0
  
  const riskScores = investments.map(inv => {
    const project = projects.find(p => p.id === inv.projectId)
    if (!project) return 1 // High risk for missing projects
    
    const completionRate = project.raisedAmount / project.goalAmount
    const ageInDays = getDaysFromCreation(project.createdAt)
    
    // Risk factors: low completion rate, old projects, high goal amounts
    let risk = 0.3 // Base risk
    if (completionRate < 0.3) risk += 0.4
    if (ageInDays > 365) risk += 0.2
    if (project.goalAmount > 100000) risk += 0.1
    
    return Math.min(risk, 1)
  })
  
  return riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
}

function calculateProjectRisk(project?: Project): string {
  if (!project) return 'High'
  
  const completionRate = project.raisedAmount / project.goalAmount
  const ageInDays = getDaysFromCreation(project.createdAt)
  
  if (completionRate >= 0.8) return 'Low'
  if (completionRate >= 0.5 && ageInDays < 180) return 'Medium'
  return 'High'
}

function getFundingStage(project?: Project): string {
  if (!project) return 'Unknown'
  
  const completionRate = project.raisedAmount / project.goalAmount
  
  if (completionRate >= 1) return 'Fully Funded'
  if (completionRate >= 0.75) return 'Nearly Complete'
  if (completionRate >= 0.5) return 'Half Funded'
  if (completionRate >= 0.25) return 'Early Stage'
  return 'Just Started'
}

// Re-export the useInvestments hook from projects
export { useInvestments } from './projects'