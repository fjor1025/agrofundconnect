// Demo data utility for testing portfolio features
import { type Project, type Investment } from '@/lib/projects'

export async function createDemoInvestments() {
  // Get existing projects and investments
  const existingProjects = await spark.kv.get<Project[]>('projects') || []
  const existingInvestments = await spark.kv.get<Investment[]>('investments') || []
  
  // Only add demo data if we don't have any investments yet
  if (existingInvestments.length > 0) {
    return
  }
  
  // Create some demo projects if none exist
  if (existingProjects.length === 0) {
    const demoProjects: Project[] = [
      {
        id: 'demo_project_1',
        title: 'Organic Vegetable Farm Expansion',
        description: 'Expanding our organic vegetable farm to include greenhouse facilities for year-round production.',
        goalAmount: 50000,
        raisedAmount: 35000,
        farmerId: 'demo_farmer_1',
        farmerName: 'Sarah Thompson',
        status: 'approved',
        category: 'Organic',
        imageUrl: '',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo_project_2',
        title: 'Smart Irrigation System',
        description: 'Installing IoT-based smart irrigation system to optimize water usage and crop yields.',
        goalAmount: 25000,
        raisedAmount: 18000,
        farmerId: 'demo_farmer_2',
        farmerName: 'Mike Rodriguez',
        status: 'approved',
        category: 'Technology',
        imageUrl: '',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        updatedAt: new Date().toISOString()
      },
      {
        id: 'demo_project_3',
        title: 'Heritage Breed Cattle Ranch',
        description: 'Starting a heritage breed cattle ranch focused on sustainable and ethical livestock farming.',
        goalAmount: 75000,
        raisedAmount: 45000,
        farmerId: 'demo_farmer_3',
        farmerName: 'Emma Johnson',
        status: 'approved',
        category: 'Livestock',
        imageUrl: '',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        updatedAt: new Date().toISOString()
      }
    ]
    
    await spark.kv.set('projects', [...existingProjects, ...demoProjects])
  }
  
  // Create demo investments for testing portfolio features
  const demoInvestments: Investment[] = [
    // Investment 1: Organic Farm - 4 months ago
    {
      id: 'demo_inv_1',
      projectId: 'demo_project_1',
      investorId: 'demo_investor_1', // This would be the current user in real usage
      amount: 5000,
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Investment 2: Smart Irrigation - 3 months ago
    {
      id: 'demo_inv_2',
      projectId: 'demo_project_2',
      investorId: 'demo_investor_1',
      amount: 3000,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Investment 3: Cattle Ranch - 2 months ago
    {
      id: 'demo_inv_3',
      projectId: 'demo_project_3',
      investorId: 'demo_investor_1',
      amount: 7500,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Investment 4: Additional investment in Organic Farm - 1 month ago
    {
      id: 'demo_inv_4',
      projectId: 'demo_project_1',
      investorId: 'demo_investor_1',
      amount: 2500,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Investment 5: Recent investment in Smart Irrigation - 2 weeks ago
    {
      id: 'demo_inv_5',
      projectId: 'demo_project_2',
      investorId: 'demo_investor_1',
      amount: 1500,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
  
  await spark.kv.set('investments', [...existingInvestments, ...demoInvestments])
}

// Helper function to reset demo data
export async function resetDemoData() {
  await spark.kv.delete('projects')
  await spark.kv.delete('investments')
  await createDemoInvestments()
}