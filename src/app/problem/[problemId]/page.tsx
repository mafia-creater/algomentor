
import { auth } from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";
import EnhancedProblemInterface from "./EnhancedProblemInterface"; // The component you provided

export default async function SolvePage({ params }: { params: { problemId: string } }) {
  const { userId } = await auth();

  // 1. Fetch the problem details
  const problem = await prisma.problem.findUnique({
    where: {
      id: parseInt(params.problemId),
    },
  });

  if (!problem) {
    return <div>Problem not found!</div>;
  }

  // 2. Fetch the user's submission progress for this problem
  let submission = null;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { externalId: userId }});
    if (user) {
      submission = await prisma.submission.findUnique({
        where: {
          userId_problemId: {
            userId: user.id,
            problemId: problem.id,
          }
        }
      });
    }
  }

  // 3. Pass both the problem and the user's submission to the client component
  return <EnhancedProblemInterface problem={problem} initialSubmission={submission} />;
}