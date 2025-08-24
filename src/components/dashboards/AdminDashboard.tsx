import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Check, X, Sprout, Users, FileText, TrendUp, SignOut, DollarSign } from '@phosphor-icons/react'
import { useAuth, type User } from '@/lib/auth'
import { useProjects, useInvestments } from '@/lib/projects'
import { toast } from 'sonner'

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const { projects, approveProject, rejectProject } = useProjects()
  const { investments } = useInvestments()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    approvedProjects: 0,
    pendingProjects: 0,
    totalFunding: 0,
    totalUsers: 0
  })

  useEffect(() => {
    const loadUsers = async () => {
      const allUsers = await spark.kv.get<User[]>('users') || []
      setUsers(allUsers)
    }
    loadUsers()
  }, [])

  useEffect(() => {
    const totalFunding = investments.reduce((sum, investment) => sum + investment.amount, 0)
    
    setStats({
      totalProjects: projects.length,
      approvedProjects: projects.filter(p => p.status === 'approved').length,
      pendingProjects: projects.filter(p => p.status === 'pending').length,
      totalFunding,
      totalUsers: users.length
    })
  }, [projects, investments, users])

  const handleApproveProject = async (projectId: string) => {
    try {
      await approveProject(projectId)
      toast.success('Project approved successfully!')
    } catch (error) {
      toast.error('Failed to approve project')
    }
  }

  const handleRejectProject = async (projectId: string) => {
    try {
      await rejectProject(projectId)
      toast.success('Project rejected')
    } catch (error) {
      toast.error('Failed to reject project')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Farmer': return 'bg-green-100 text-green-800'
      case 'Investor': return 'bg-blue-100 text-blue-800'
      case 'Admin': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sprout size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform Management</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} size="sm">
            <SignOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingProjects} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Projects</CardTitle>
              <Check size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedProjects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalProjects > 0 ? ((stats.approvedProjects / stats.totalProjects) * 100).toFixed(1) : 0}% approval rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
              <DollarSign size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalFunding.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {investments.length} total investments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
              <Users size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.role === 'Farmer').length} farmers, {users.filter(u => u.role === 'Investor').length} investors
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">Project Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Project Management</h2>
              <p className="text-muted-foreground mb-6">Review and manage project submissions</p>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects submitted</h3>
                  <p className="text-muted-foreground">Projects will appear here when farmers submit them</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const fundingPercentage = (project.raisedAmount / project.goalAmount) * 100
                  
                  return (
                    <Card key={project.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {project.title}
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {project.category} • by {project.farmerName}
                            </CardDescription>
                          </div>
                          {project.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveProject(project.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check size={16} className="mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectProject(project.id)}
                              >
                                <X size={16} className="mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium">Funding Goal</p>
                            <p className="text-lg font-bold">${project.goalAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Amount Raised</p>
                            <p className="text-lg font-bold text-primary">${project.raisedAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Progress</p>
                            <div className="flex items-center gap-2">
                              <Progress value={fundingPercentage} className="h-2 flex-1" />
                              <span className="text-sm text-muted-foreground">{fundingPercentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-xs text-muted-foreground">
                          Created: {new Date(project.createdAt).toLocaleDateString()} • 
                          Updated: {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">User Management</h2>
              <p className="text-muted-foreground mb-6">Overview of platform users</p>
            </div>

            {users.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No users registered</h3>
                  <p className="text-muted-foreground">User accounts will appear here when they register</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {users.map((userData) => (
                  <Card key={userData.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{userData.name || userData.email}</h3>
                          <Badge className={getRoleColor(userData.role)}>
                            {userData.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{userData.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">User ID</p>
                        <p className="text-xs font-mono">{userData.id}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Platform Reports</h2>
              <p className="text-muted-foreground mb-6">Analytics and insights</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendUp size={20} />
                    Project Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Projects:</span>
                    <span className="font-semibold">{stats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved:</span>
                    <span className="font-semibold text-green-600">{stats.approvedProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-semibold text-yellow-600">{stats.pendingProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rejected:</span>
                    <span className="font-semibold text-red-600">
                      {projects.filter(p => p.status === 'rejected').length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={20} />
                    Funding Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Investments:</span>
                    <span className="font-semibold">{investments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold text-primary">${stats.totalFunding.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Investment:</span>
                    <span className="font-semibold">
                      ${investments.length > 0 ? (stats.totalFunding / investments.length).toFixed(0) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Investors:</span>
                    <span className="font-semibold">
                      {new Set(investments.map(i => i.investorId)).size}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}