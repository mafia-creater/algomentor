import prisma from "@/lib/prisma";
import ProblemInterface from "./problem-interface"; // Import the client component

// This is an async Server Component
export default async function SingleProblemPage({ params }: { params: { problemId: string } }) {
  
  // Fetch the specific problem from the database
  const problem = await prisma.problem.findUnique({
    where: {
      id: parseInt(params.problemId), // This is safe in a Server Component
    },
  });

  if (!problem) {
    return <div>Problem not found!</div>;
  }

  // Render the interactive client component and pass the problem data to it
  return <ProblemInterface problem={problem} />;
}