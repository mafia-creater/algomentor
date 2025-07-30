import { Badge } from "@/components/ui/badge"

interface DashboardStats {
  totalProblems: number
  easyCount: number
  mediumCount: number
  hardCount: number
}

interface DashboardHeaderProps {
  stats: DashboardStats
}

export function DashboardHeader({ stats }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Problem Dashboard</h1>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {stats.totalProblems} Problems
        </Badge>
      </div>
      
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span className="text-gray-600">Easy: {stats.easyCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-200 rounded"></div>
          <span className="text-gray-600">Medium: {stats.mediumCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 rounded"></div>
          <span className="text-gray-600">Hard: {stats.hardCount}</span>
        </div>
      </div>
    </div>
  )
}