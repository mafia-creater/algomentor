import prisma from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ProblemsTable } from "@/components/dashboard/ProblemsTable"

// This page will be rendered on the server
export default async function DashboardPage() {
  // 1. Fetch all problems from the database
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      difficulty: true,
      tags: true,
      totalSubmissions: true,
      acceptanceRate: true,
    },
    orderBy: {
      id: 'asc'
    }
  });

  // Calculate stats for header
  const stats = {
    totalProblems: problems.length,
    easyCount: problems.filter(p => p.difficulty === 'EASY').length,
    mediumCount: problems.filter(p => p.difficulty === 'MEDIUM').length,
    hardCount: problems.filter(p => p.difficulty === 'HARD').length,
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <DashboardHeader stats={stats} />
      <ProblemsTable problems={problems} />
    </div>
  )
}