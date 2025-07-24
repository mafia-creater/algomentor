import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import prisma from "@/lib/prisma"

// This page will be rendered on the server
export default async function DashboardPage() {
  // 1. Fetch all problems from the database
  const problems = await prisma.problem.findMany();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Problem Dashboard</h1>
      <Table>
        <TableCaption>A list of available problems.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 2. Map over the problems and render a row for each one */}
          {problems.map((problem) => (
            <TableRow key={problem.id}>
              <TableCell className="font-medium">{problem.title}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    problem.difficulty === 'EASY' ? 'default' :
                    problem.difficulty === 'MEDIUM' ? 'secondary' :
                    'destructive'
                  }
                >
                  {problem.difficulty}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                {problem.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}