import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    // Try multiple approaches to get the user
    let userId: string | null = null;
    
    // Method 1: Try auth()
    try {
      const authResult = await auth();
      userId = authResult.userId;
      console.log('auth() result:', authResult);
    } catch (error) {
      console.log('auth() failed:', error);
    }
    
    // Method 2: Try currentUser() if auth() failed
    if (!userId) {
      try {
        const user = await currentUser();
        userId = user?.id || null;
        console.log('currentUser() result:', user?.id);
      } catch (error) {
        console.log('currentUser() failed:', error);
      }
    }
    
    // Method 3: Try to extract from headers directly
    if (!userId) {
      const authToken = req.headers.get('x-clerk-auth-token');
      console.log('Auth token from headers:', authToken ? 'present' : 'missing');
      
      if (authToken) {
        try {
          // Decode the JWT token to extract userId
          const payload = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64').toString());
          userId = payload.sub;
          console.log('Extracted userId from token:', userId);
        } catch (error) {
          console.log('Failed to decode token:', error);
        }
      }
    }
    
    if (!userId) {
      console.error("All authentication methods failed");
      return new Response("Unauthorized: Please sign in", { status: 401 });
    }
    
    console.log('Final userId:', userId);

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

    const prompt = `You are an expert programming interview coach. A user is solving the following problem:
    Problem Title: ${problem.title}
    Problem Description: ${problem.description}
    The user has rephrased the problem as:
    User's Understanding: ${userText}
    Your task is to analyze the user's understanding. Compare it against the problem's requirements. Do not reveal the solution. Provide gentle, constructive feedback. If their understanding is perfect, congratulate them. If they missed something, ask a guiding question.
    
    IMPORTANT: Respond with ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or extra text. Just the raw JSON with two keys: "isCorrect" (boolean) and "feedback" (string).
    
    Example response format:
    {"isCorrect": true, "feedback": "Great job! You understand the problem correctly."}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResultText = response.text();
    
    // Clean up the AI response - remove markdown code blocks if present
    aiResultText = aiResultText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    let aiResult;
    try {
      aiResult = JSON.parse(aiResultText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResultText);
      console.error('Parse error:', parseError);
      aiResult = {
        isCorrect: false,
        feedback: "I apologize, but I encountered an error processing your response. Please try again."
      };
    }
    
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