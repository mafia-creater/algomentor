import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { problemDescription, code, language, failedTestCase, error } = await req.json();

    const prompt = `You are an expert programming tutor. A user is trying to solve a coding problem, but their code is failing a specific test case. Your task is to provide a helpful hint without giving away the solution.

    ## Problem Description:
    ${problemDescription}

    ## User's Code (${language}):
    \`\`\`${language}
    ${code}
    \`\`\`

    ## The Failing Test Case:
    - Input: ${failedTestCase.input}
    - Expected Output: ${failedTestCase.output}
    - Actual Output / Error: ${error}

    ## Your Task:
    1. Analyze the user's code to understand their logic.
    2. Identify why their code fails the given test case.
    3. Provide a short, constructive hint that points them in the right direction. Focus on the logical error. Do not write any code.
    
    IMPORTANT: Respond ONLY with a valid JSON object with one key: "hint" (string).
    
    Example response format:
    {"hint": "Your current approach seems to be resetting a variable at the wrong time in your loop. Consider what should happen to that variable's value after each iteration."}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const aiResult = JSON.parse(result.response.text());

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("Debug API - Internal error:", error);
    return new Response("An internal error occurred while generating a hint.", { status: 500 });
  }
}