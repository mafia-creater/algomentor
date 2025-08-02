

import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProblemsTable } from "@/components/dashboard/ProblemsTable";
import redis from "@/lib/redis";

// Define ProblemForTable type if not globally available
type ProblemForTable = {
  id: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  totalSubmissions: number;
  acceptanceRate?: number | null;
};

// This page will be rendered on the server
export default async function DashboardPage() {
  const { userId } = await auth();
  const cacheKey = "problems:dashboard";
  let problems: ProblemForTable[] = [];
  let fromCache = false;
  try {
    const cachedProblems = await redis.get(cacheKey);
    if (cachedProblems) {
      problems = JSON.parse(cachedProblems);
      fromCache = true;
    }
  } catch (error) {
    console.error('❌ Error fetching problems from Redis:', error);
  }

  if (!fromCache) {
    problems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        tags: true,
        totalSubmissions: true,
        acceptanceRate: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    try {
      await redis.set(cacheKey, JSON.stringify(problems), 'EX', 60 * 60);
    } catch (error) {
      console.error('❌ Error setting problems in Redis:', error);
    }
  }

  // Fetch solved submissions for this user
  let solvedProblemIds: Set<number> = new Set();
  if (userId) {
    const solvedSubs = await prisma.submission.findMany({
      where: { user: { externalId: userId }, currentPhase: { gte: 5 } },
      select: { problemId: true },
    });
    solvedProblemIds = new Set(solvedSubs.map(s => s.problemId));
  }

  // Add isSolved to each problem
  const problemsWithStatus = problems.map(p => ({
    ...p,
    isSolved: solvedProblemIds.has(p.id),
  }));

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
      <ProblemsTable problems={problemsWithStatus} />
    </div>
  )
}