import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sprout, DollarSign, Calendar, TrendUp, SignOut, Search, SlidersHorizontal } from '@phosphor-icons/react'
import { useAuth } from '@/lib/auth'
import { useProjects, type Project } from '@/lib/projects'
import { toast } from 'sonner'

export function InvestorDashboard() {
  const { user, logout } = useAuth()
  const { getApprovedProjects, fundProject } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [fundingAmount, setFundingAmount] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const approvedProjects = getApprovedProjects()
  
  const filteredProjects = approvedProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleFundProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProject || !fundingAmount) {
      toast.error('Please enter a funding amount')
      return
    }

    const amount = parseFloat(fundingAmount)
    if (amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > (selectedProject.goalAmount - selectedProject.raisedAmount)) {
      toast.error('Amount exceeds remaining funding needed')
      return
    }

    try {
      await fundProject(selectedProject.id, user!.id, amount)
      toast.success(`Successfully funded $${amount.toLocaleString()}!`)
      setSelectedProject(null)
      setFundingAmount('')
    } catch (error) {
      toast.error('Failed to process funding')
    }
  }

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project)
    setFundingAmount('')
  }

  const categories = ['all', 'Crops', 'Livestock', 'Equipment', 'Organic', 'Technology']

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sprout size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Investor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} size="sm">
            <SignOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Investment Opportunities</h2>
            <p className="text-muted-foreground">Discover and fund agricultural projects</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal size={16} />
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sprout size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No approved projects available for investment yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const fundingPercentage = (project.raisedAmount / project.goalAmount) * 100
              const remainingAmount = project.goalAmount - project.raisedAmount
              
              return (
                <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="secondary">{project.category}</Badge>
                          <span>by {project.farmerName}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {fundingPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={fundingPercentage} className="h-2" />
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-muted-foreground">
                            ${project.raisedAmount.toLocaleString()} raised
                          </span>
                          <span className="font-medium">
                            ${project.goalAmount.toLocaleString()} goal
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendUp size={14} />
                          ${remainingAmount.toLocaleString()} needed
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => openProjectDetail(project)}
                        disabled={remainingAmount <= 0}
                      >
                        {remainingAmount <= 0 ? 'Fully Funded' : 'Fund Project'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent className="max-w-2xl">
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedProject.category}</Badge>
                    <span>by {selectedProject.farmerName}</span>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {selectedProject.imageUrl && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={selectedProject.imageUrl} 
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-2">Project Description</h3>
                    <p className="text-muted-foreground">{selectedProject.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Funding Goal</h4>
                      <p className="text-2xl font-bold">${selectedProject.goalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Amount Raised</h4>
                      <p className="text-2xl font-bold text-primary">${selectedProject.raisedAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Funding Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {((selectedProject.raisedAmount / selectedProject.goalAmount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(selectedProject.raisedAmount / selectedProject.goalAmount) * 100} className="h-3" />
                  </div>

                  <form onSubmit={handleFundProject} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="funding-amount">Investment Amount ($)</Label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="funding-amount"
                          type="number"
                          placeholder="1000"
                          className="pl-10"
                          value={fundingAmount}
                          onChange={(e) => setFundingAmount(e.target.value)}
                          max={selectedProject.goalAmount - selectedProject.raisedAmount}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Maximum: ${(selectedProject.goalAmount - selectedProject.raisedAmount).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={!fundingAmount || parseFloat(fundingAmount) <= 0}>
                        Invest ${fundingAmount ? parseFloat(fundingAmount).toLocaleString() : '0'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setSelectedProject(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}