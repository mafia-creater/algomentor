import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { problemId, algorithmText } = await req.json();

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) return new Response("Problem not found", { status: 404 });

    const user = await prisma.user.findUnique({ where: { externalId: userId } });
    if (!user) return new Response("User not found in DB", { status: 404 });

    // AI Prompt for reviewing the algorithm
    const prompt = `You are a senior software engineer mentoring a developer. The user has designed an algorithm in plain English for the following problem:
    Problem: ${problem.description}

    User's Algorithm Design:
    ${algorithmText}

    Your Task:
    1. Review the algorithm for logical errors, off-by-one errors, or incorrect assumptions.
    2. Consider its time and space complexity. If it's a brute-force approach, gently ask if there might be a more optimal way without giving away the answer.
    3. Provide clear, actionable, and encouraging feedback.
    
    IMPORTANT: Respond ONLY with a valid JSON object with one key: "feedback" (string).
    
    Example response format:
    {"feedback": "This is a good start. Your logic for iterating through the array is correct. Have you considered what happens if the input array is empty?"}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResultText = response.text();
    aiResultText = aiResultText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    const aiResult = JSON.parse(aiResultText);

    // Update the submission in the database
    await prisma.submission.update({
      where: { userId_problemId: { userId: user.id, problemId } },
      data: {
        phase3_algorithm: {
          userAlgorithm: algorithmText,
          aiFeedback: aiResult.feedback,
        },
        currentPhase: 4, // Advance user to Phase 4
      },
    });

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("Phase 3 - Internal error:", error);
    return new Response("An internal error occurred", { status: 500 });
  }
}