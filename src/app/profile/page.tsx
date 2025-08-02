import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return <div>You must be signed in to view this page.</div>;
  }

  // Fetch the user from our database to get their internal ID
  const dbUser = await prisma.user.findUnique({
    where: { externalId: userId },
  });

  if (!dbUser) {
    return <div>User not found in our database.</div>;
  }

  // Fetch all submissions for this user, including the related problem details
  const submissions = await prisma.submission.findMany({
    where: { userId: dbUser.id },
    include: {
      problem: true, // This includes the full problem object in each submission
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Calculate statistics
  const totalSolved = submissions.filter(s => s.currentPhase >= 5).length;
  const easySolved = submissions.filter(s => s.currentPhase >= 5 && s.problem.difficulty === 'EASY').length;
  const mediumSolved = submissions.filter(s => s.currentPhase >= 5 && s.problem.difficulty === 'MEDIUM').length;
  const hardSolved = submissions.filter(s => s.currentPhase >= 5 && s.problem.difficulty === 'HARD').length;
  
  const totalProblems = await prisma.problem.count();

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* User Info Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src={user.imageUrl} alt="Profile" className="w-20 h-20 rounded-full" />
        <div>
          <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
          <p className="text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Problems Solved</span>
            <span className="font-bold text-lg">{totalSolved} / {totalProblems}</span>
          </div>
          <Progress value={(totalSolved / totalProblems) * 100} />
          <div className="grid grid-cols-3 gap-4 text-center pt-4">
            <div>
              <p className="text-2xl font-bold text-green-600">{easySolved}</p>
              <p className="text-sm text-gray-500">Easy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{mediumSolved}</p>
              <p className="text-sm text-gray-500">Medium</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{hardSolved}</p>
              <p className="text-sm text-gray-500">Hard</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>A list of all the problems you've worked on.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    <Link href={`/problem/${submission.problem.id}`} className="hover:underline">
                      {submission.problem.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {submission.currentPhase >= 5 ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Solved
                      </Badge>
                    ) : (
                      <Badge variant="secondary">In Progress</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(submission.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}