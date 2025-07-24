import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      console.error("Clerk authentication failed: No userId found. Possible missing session cookie or not signed in.");
      return new Response("Unauthorized: Please sign in. If you are signed in, ensure your session cookie is sent with the request.", { status: 401 });
    }

    const { problemId, userText } = await req.json();

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

    // The AI prompt is the same, but we add instructions for JSON output
    const prompt = `You are an expert programming interview coach. A user is solving the following problem:
    Problem Title: ${problem.title}
    Problem Description: ${problem.description}
    The user has rephrased the problem as:
    User's Understanding: ${userText}
    Your task is to analyze the user's understanding. Compare it against the problem's requirements. Do not reveal the solution. Provide gentle, constructive feedback. If their understanding is perfect, congratulate them. If they missed something, ask a guiding question.
    Respond ONLY with a valid JSON object with two keys: "isCorrect" (boolean) and "feedback" (string).`;

    // Call the Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResultText = response.text();
    const aiResult = JSON.parse(aiResultText);
    
    // Save submission to database
    await prisma.submission.upsert({
      where: { userId_problemId: { userId: user.id, problemId } },
      update: {
        phase1_understanding: {
          userText: userText,
          aiFeedback: aiResult.feedback,
        },
      },
      create: {
        userId: user.id,
        problemId: problemId,
        currentPhase: 1,
        phase1_understanding: {
          userText: userText,
          aiFeedback: aiResult.feedback,
        },
      },
    });

    return NextResponse.json(aiResult);

  } catch (error) {
    console.error(error);
    return new Response("An internal error occurred", { status: 500 });
  }
}