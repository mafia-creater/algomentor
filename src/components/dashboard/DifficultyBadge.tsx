import { Badge } from "@/components/ui/badge"

interface DifficultyBadgeProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const getVariantAndColor = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-200' }
      case 'MEDIUM':
        return { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' }
      case 'HARD':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 hover:bg-red-200' }
      default:
        return { variant: 'default' as const, className: '' }
    }
  }

  const { variant, className } = getVariantAndColor(difficulty)

  return (
    <Badge variant={variant} className={className}>
      {difficulty}
    </Badge>
  )
}