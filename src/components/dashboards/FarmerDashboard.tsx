import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Sprout, DollarSign, Calendar, PencilSimple, SignOut, BarChart, FolderOpen } from '@phosphor-icons/react'
import { useAuth } from '@/lib/auth'
import { useProjects, type Project } from '@/lib/projects'
import { FarmerAnalytics } from '@/components/FarmerAnalytics'
import { toast } from 'sonner'

export function FarmerDashboard() {
  const { user, logout } = useAuth()
  const { projects, createProject, updateProject, getProjectsByFarmer } = useProjects()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState('projects')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: '',
    imageUrl: ''
  })

  const farmerProjects = getProjectsByFarmer(user?.id || '')

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.goalAmount || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createProject({
        title: formData.title,
        description: formData.description,
        goalAmount: parseFloat(formData.goalAmount),
        farmerId: user!.id,
        farmerName: user!.name || user!.email,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined
      })

      toast.success('Project created successfully!')
      setShowCreateDialog(false)
      setFormData({ title: '', description: '', goalAmount: '', category: '', imageUrl: '' })
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProject) return

    try {
      await updateProject(editingProject.id, {
        title: formData.title,
        description: formData.description,
        goalAmount: parseFloat(formData.goalAmount),
        category: formData.category,
        imageUrl: formData.imageUrl || undefined
      })

      toast.success('Project updated successfully!')
      setEditingProject(null)
      setFormData({ title: '', description: '', goalAmount: '', category: '', imageUrl: '' })
    } catch (error) {
      toast.error('Failed to update project')
    }
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      goalAmount: project.goalAmount.toString(),
      category: project.category,
      imageUrl: project.imageUrl || ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Sprout size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Farmer Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={logout} 
            size="lg"
            className="hover-lift border-2 hover:border-destructive/50 hover:text-destructive transition-all duration-200"
          >
            <SignOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-card/50 backdrop-blur-sm border shadow-md">
            <TabsTrigger 
              value="projects" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover-scale"
            >
              <FolderOpen size={18} />
              My Projects
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover-scale"
            >
              <BarChart size={18} />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="animate-slide-up">
                <h2 className="text-3xl font-bold text-gradient mb-2">Your Projects</h2>
                <p className="text-muted-foreground text-lg">Manage your funding projects and track their progress</p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg px-6 py-3">
                    <Plus size={20} className="mr-2" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl glass-effect">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gradient">Create New Project</DialogTitle>
                <DialogDescription>
                  Submit your project for funding consideration
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Organic Tomato Farm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Crops">Crops</SelectItem>
                        <SelectItem value="Livestock">Livestock</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Organic">Organic Farming</SelectItem>
                        <SelectItem value="Technology">AgTech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project, its goals, and impact..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalAmount">Funding Goal ($) *</Label>
                    <Input
                      id="goalAmount"
                      type="number"
                      value={formData.goalAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, goalAmount: e.target.value }))}
                      placeholder="25000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit">Create Project</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {farmerProjects.length === 0 ? (
          <Card className="card-hover animate-scale-in">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 animate-bounce-gentle">
                <Sprout size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gradient mb-3">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md text-lg leading-relaxed">
                Create your first project to start receiving funding from investors and bring your agricultural vision to life
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg px-8 py-3"
              >
                <Plus size={20} className="mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8">
            {farmerProjects.map((project, index) => {
              const fundingPercentage = (project.raisedAmount / project.goalAmount) * 100
              
              return (
                <Card 
                  key={project.id} 
                  className="card-hover animate-slide-up gradient-card shadow-lg"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 text-xl mb-2">
                          {project.title}
                          <Badge className={`${getStatusColor(project.status)} shadow-sm font-medium px-3 py-1`}>
                            {project.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">{project.category}</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => openEditDialog(project)}
                        disabled={project.status === 'approved'}
                        className="hover-lift border-2 hover:border-primary/50"
                      >
                        <PencilSimple size={18} className="mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-6 leading-relaxed">{project.description}</p>
                    
                    <div className="space-y-6">
                      <div className="bg-muted/30 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-foreground">Funding Progress</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              ${project.raisedAmount.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              of ${project.goalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={fundingPercentage} 
                          className="h-3 bg-background/50" 
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm font-medium text-primary">
                            {fundingPercentage.toFixed(1)}% funded
                          </p>
                          {fundingPercentage >= 100 && (
                            <Badge className="bg-green-100 text-green-800">Fully Funded!</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} />
                          Goal: ${project.goalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
          </TabsContent>
          
          <TabsContent value="analytics">
            <FarmerAnalytics />
          </TabsContent>
        </Tabs>

        <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update your project details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditProject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Project Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crops">Crops</SelectItem>
                      <SelectItem value="Livestock">Livestock</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Organic">Organic Farming</SelectItem>
                      <SelectItem value="Technology">AgTech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-goalAmount">Funding Goal ($) *</Label>
                  <Input
                    id="edit-goalAmount"
                    type="number"
                    value={formData.goalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, goalAmount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-imageUrl">Image URL (optional)</Label>
                  <Input
                    id="edit-imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit">Update Project</Button>
                <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}