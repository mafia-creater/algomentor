import { Badge } from "@/components/ui/badge"

interface StatsBadgeProps {
  acceptanceRate?: number | null
  totalSubmissions: number
}

export function StatsBadge({ acceptanceRate, totalSubmissions }: StatsBadgeProps) {
  if (totalSubmissions === 0) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600">
        No submissions
      </Badge>
    )
  }

  const rate = acceptanceRate || 0
  const getColor = (rate: number) => {
    if (rate >= 70) return 'bg-green-50 text-green-700 border-green-200'
    if (rate >= 40) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge variant="outline" className={getColor(rate)}>
        {rate.toFixed(1)}% accepted
      </Badge>
      <span className="text-xs text-gray-500">
        {totalSubmissions} submission{totalSubmissions !== 1 ? 's' : ''}
      </span>
    </div>
  )
}