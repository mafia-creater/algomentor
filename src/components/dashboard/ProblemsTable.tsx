import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link";
import { ProblemRow } from "./ProblemRow"

interface Problem {
  id: number
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tags: string[]
  totalSubmissions: number
  acceptanceRate?: number | null
}

interface ProblemsTableProps {
  problems: Problem[]
}

export function ProblemsTable({ problems }: ProblemsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <Table>
        <TableCaption className="py-4 text-gray-600">
          A list of {problems.length} available problems.
        </TableCaption>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold text-gray-900">Problem</TableHead>
            <TableHead className="font-semibold text-gray-900">Difficulty</TableHead>
            <TableHead className="font-semibold text-gray-900">Tags</TableHead>
            <TableHead className="font-semibold text-gray-900">Statistics</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <ProblemRow key={problem.id} problem={problem} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
// With:
// <td>
//   <Link href={`/problem/${problem.id}`} className="text-blue-600 hover:underline">
//     {problem.title}
//   </Link>
// </td>