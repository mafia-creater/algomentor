import prisma from "@/lib/prisma";
import ProblemInterface from "./problem-interface"; // Import the client component

// This is an async Server Component
// In your server component
export default async function SingleProblemPage({ params }: { params: { problemId: string } }) {
  try {
    const problemId = parseInt(params.problemId);
    
    // Validate the ID is a valid number
    if (isNaN(problemId)) {
      return <div>Invalid problem ID</div>;
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return <div>Problem not found!</div>;
    }

    return <ProblemInterface problem={problem} />;
  } catch (error) {
    console.error('Error fetching problem:', error);
    return <div>Error loading problem. Please try again.</div>;
  }
}