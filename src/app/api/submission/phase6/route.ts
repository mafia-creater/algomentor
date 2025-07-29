import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { problemId } = await req.json();
    
    const user = await prisma.user.findUnique({ where: { externalId: userId } });
    if (!user) return new Response("User not found", { status: 404 });

    // Fetch the entire submission record for this user and problem
    const submission = await prisma.submission.findUnique({
      where: { userId_problemId: { userId: user.id, problemId } },
      include: { problem: true } // Include problem details
    });

    if (!submission) return new Response("Submission not found", { status: 404 });

    // Construct a comprehensive prompt with all the user's work
    const prompt = `
    You are an expert programming interview coach providing a final summary of a student's work on a coding problem.

    ## Problem: ${submission.problem.title}
    
    ## Student's Work Summary:
    - **Phase 1 (Understanding):** ${JSON.stringify(submission.phase1_understanding)}
    - **Phase 2 (Test Cases):** ${JSON.stringify(submission.phase2_testCases)}
    - **Phase 3 (Algorithm):** ${JSON.stringify(submission.phase3_algorithm)}
    - **Phase 4 (Final Code):** ${JSON.stringify(submission.phase4_code)}
    - **Phase 5 (Complexity Analysis):** ${JSON.stringify(submission.phase5_review)}

    ## Your Task:
    Provide a final, holistic review of the student's performance.
    1.  **Strengths:** Briefly mention one or two things they did well (e.g., "You did an excellent job creating thorough test cases.").
    2.  **Areas for Improvement:** Point out one key area they could improve (e.g., "Your initial algorithm was a brute-force approach. Try to think about more optimal data structures earlier in the process.").
    3.  **Suggested Problems:** Suggest one or two titles of similar, classic coding problems that would be good practice next.
    
    IMPORTANT: Respond ONLY with a valid JSON object with this exact structure:
    {
      "strengths": "string",
      "improvementArea": "string",
      "suggestedProblems": ["string", "string"]
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const aiResult = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());

    // Update the submission with the final review
    await prisma.submission.update({
      where: { userId_problemId: { userId: user.id, problemId } },
      data: {
        phase6_aiFeedback: aiResult as any,
        currentPhase: 6, // Mark phase 6 as the final phase
      },
    });

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("Phase 6 API Error:", error);
    return new Response("An internal error occurred", { status: 500 });
  }
}