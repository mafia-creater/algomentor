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

    const { problemId, code, language } = await req.json();

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) return new Response("Problem not found", { status: 404 });
    
    const user = await prisma.user.findUnique({ where: { externalId: userId } });
    if (!user) return new Response("User not found", { status: 404 });

    const prompt = `You are a computer science professor. A user has submitted a correct solution to a problem.
    Problem Description: ${problem.description}
    
    User's Code (${language}):
    \`\`\`${language}
    ${code}
    \`\`\`

    Your Task:
    1. Analyze the provided code and determine its time complexity and space complexity in Big O notation.
    2. Provide a brief, one-sentence explanation for each complexity.
    3. If a more optimal solution exists, provide a subtle hint towards it.
    
    IMPORTANT: Respond ONLY with a valid JSON object with this exact structure:
    {
      "timeComplexity": "string",
      "timeExplanation": "string",
      "spaceComplexity": "string",
      "optimizationHint": "string"
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Corrected model name
    const result = await model.generateContent(prompt);
    
    // --- THIS IS THE FIX ---
    // Get the raw text from the AI's response
    let aiResponseText = result.response.text();
    // Clean the text by removing the Markdown fences and trim whitespace
    aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    // Now, parse the cleaned text
    const aiResult = JSON.parse(aiResponseText);
    // --- END OF FIX ---

    await prisma.submission.update({
      where: { userId_problemId: { userId: user.id, problemId } },
      data: {
        phase5_review: aiResult as any,
        currentPhase: 5,
      },
    });

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("Phase 5 - Internal error:", error);
    return new Response("An internal error occurred", { status: 500 });
  }
}