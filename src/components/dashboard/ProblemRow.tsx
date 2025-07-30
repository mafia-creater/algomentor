import { TableCell, TableRow } from "@/components/ui/table"
import { DifficultyBadge } from "./DifficultyBadge"
import { TagList } from "./TagList"
import Link from "next/link"
import { StatsBadge } from "./StatsBadge"

interface Problem {
  id: number
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tags: string[]
  totalSubmissions: number
  acceptanceRate?: number | null
}

interface ProblemRowProps {
  problem: Problem
}

export function ProblemRow({ problem }: ProblemRowProps) {
  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <Link href={`/problem/${problem.id}`}>
            <span className="text-sm font-semibold text-gray-900">
               {problem.title}
            </span>
          </Link>
          <span className="text-xs text-gray-500">
            Problem #{problem.id}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <DifficultyBadge difficulty={problem.difficulty} />
      </TableCell>
      <TableCell>
        <TagList tags={problem.tags} maxTags={3} />
      </TableCell>
      <TableCell>
        <StatsBadge
          acceptanceRate={problem.acceptanceRate}
          totalSubmissions={problem.totalSubmissions}
        />
      </TableCell>
    </TableRow>
  )
}