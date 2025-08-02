'use client';

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProblemRow } from "./ProblemRow";

// Update the interface to include the 'isSolved' status
interface ProblemWithStatus {
  id: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  isSolved: boolean;
  totalSubmissions?: number | null;
  acceptanceRate?: number | null;
}

interface ProblemsTableProps {
  problems: ProblemWithStatus[];
}

export function ProblemsTable({ problems }: ProblemsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficulty === 'all' || problem.difficulty === difficulty;
      const matchesStatus = status === 'all' ||
        (status === 'solved' && problem.isSolved) ||
        (status === 'unsolved' && !problem.isSolved);
      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [problems, searchTerm, difficulty, status]);

  return (
    <div>
      {/* --- Filter Controls --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-card">
        <Input
          placeholder="Search by problem title..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-4">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="unsolved">Unsolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Problems Table --- */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableCaption className="py-4 text-gray-600">
            Showing {filteredProblems.length} of {problems.length} available problems.
          </TableCaption>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[100px] font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Problem</TableHead>
              <TableHead className="font-semibold text-gray-900">Difficulty</TableHead>
              <TableHead className="font-semibold text-gray-900">Tags</TableHead>
              <TableHead className="font-semibold text-gray-900">Statistics</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProblems.map((problem) => (
              <ProblemRow key={problem.id} problem={problem} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
