import { useKV } from '@github/spark/hooks'

export interface Project {
  id: string
  title: string
  description: string
  goalAmount: number
  raisedAmount: number
  farmerId: string
  farmerName: string
  status: 'pending' | 'approved' | 'rejected'
  category: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Investment {
  id: string
  projectId: string
  investorId: string
  amount: number
  createdAt: string
}

export function useProjects() {
  const [projects, setProjects] = useKV<Project[]>('projects', [])

  const createProject = async (projectData: Omit<Project, 'id' | 'raisedAmount' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const newProject: Project = {
      ...projectData,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      raisedAmount: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setProjects(current => [...current, newProject])
    return newProject
  }

  const updateProject = async (projectId: string, updates: Partial<Project>): Promise<void> => {
    setProjects(current =>
      current.map(project =>
        project.id === projectId
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      )
    )
  }

  const approveProject = async (projectId: string): Promise<void> => {
    await updateProject(projectId, { status: 'approved' })
  }

  const rejectProject = async (projectId: string): Promise<void> => {
    await updateProject(projectId, { status: 'rejected' })
  }

  const fundProject = async (projectId: string, investorId: string, amount: number): Promise<void> => {
    const project = projects.find(p => p.id === projectId)
    if (!project) throw new Error('Project not found')

    const newInvestment: Investment = {
      id: `investment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      investorId,
      amount,
      createdAt: new Date().toISOString()
    }

    const investments = await spark.kv.get<Investment[]>('investments') || []
    await spark.kv.set('investments', [...investments, newInvestment])

    await updateProject(projectId, {
      raisedAmount: project.raisedAmount + amount
    })
  }

  const getProjectsByFarmer = (farmerId: string): Project[] => {
    return projects.filter(project => project.farmerId === farmerId)
  }

  const getApprovedProjects = (): Project[] => {
    return projects.filter(project => project.status === 'approved')
  }

  return {
    projects,
    createProject,
    updateProject,
    approveProject,
    rejectProject,
    fundProject,
    getProjectsByFarmer,
    getApprovedProjects
  }
}

export function useInvestments() {
  const [investments, setInvestments] = useKV<Investment[]>('investments', [])

  const getInvestmentsByProject = (projectId: string): Investment[] => {
    return investments.filter(investment => investment.projectId === projectId)
  }

  const getInvestmentsByInvestor = (investorId: string): Investment[] => {
    return investments.filter(investment => investment.investorId === investorId)
  }

  return {
    investments,
    getInvestmentsByProject,
    getInvestmentsByInvestor
  }
}