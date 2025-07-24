import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    // --- Robust Authentication ---
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
      console.log('Phase 2 - auth() result:', authResult);
    } catch (error) {
      console.log('Phase 2 - auth() failed:', error);
    }

    if (!userId) {
      try {
        const user = await currentUser();
        userId = user?.id || null;
        console.log('Phase 2 - currentUser() result:', user?.id);
      } catch (error) {
        console.log('Phase 2 - currentUser() failed:', error);
      }
    }

    if (!userId) {
      console.error("All authentication methods for Phase 2 failed");
      return new Response("Unauthorized: Please sign in", { status: 401 });
    }
    
    console.log('Phase 2 - Final userId:', userId);

    const { problemId, testCases } = await req.json();

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return new Response("Problem not found", { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { externalId: userId },
    });

    if (!user) {
      return new Response("User not found in DB", { status: 404 });
    }
    
    // --- AI Prompt for Phase 2 ---
    const prompt = `You are an expert Quality Assurance engineer. A user is creating test cases for the following problem:
    Problem Description: ${problem.description}

    Here are the test cases the user created:
    ${JSON.stringify(testCases)}

    Your task is to review these test cases.
    1. Praise the user for the valid cases they created.
    2. Identify any missing common edge cases (e.g., empty inputs, duplicates, large numbers, zero, negative values).
    3. Do not provide the expected output for the edge cases, just suggest the input to consider.
    
    IMPORTANT: Respond ONLY with a valid JSON object. Do not include any markdown formatting, code blocks, or extra text. Just the raw JSON with two keys: "feedback" (string) and "suggestedEdgeCases" (an array of strings).
    
    Example response format:
    {"feedback": "You've done a great job covering the basic cases.", "suggestedEdgeCases": ["An empty array", "An array with negative numbers"]}`;
    
    // --- AI Call and Response Parsing ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResultText = response.text();

    aiResultText = aiResultText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();

    let aiResult;
    try {
      aiResult = JSON.parse(aiResultText);
    } catch (parseError) {
      console.error('Phase 2 - Failed to parse AI response:', aiResultText);
      console.error('Phase 2 - Parse error:', parseError);
      aiResult = {
        feedback: "I apologize, but I couldn't process your test cases properly. Please check their format and try again.",
        suggestedEdgeCases: []
      };
    }

    // --- Database Update ---
    await prisma.submission.update({
      where: { userId_problemId: { userId: user.id, problemId } },
      data: {
        phase2_testCases: {
          userTestCases: testCases,
          aiFeedback: aiResult,
        },
        currentPhase: 3, // Advance user to the next phase
      },
    });

    return NextResponse.json(aiResult);

  } catch (error) {
    console.error("Phase 2 - Internal error:", error);
    return new Response("An internal error occurred", { status: 500 });
  }
}