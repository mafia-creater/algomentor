import { NextResponse } from 'next/server';

// Map our language names to Judge0 language IDs
const languageMap: { [key: string]: number } = {
  javascript: 93,
  python: 71,
  java: 62,
  cpp: 54,
};

export async function POST(req: Request) {
  try {
    const { language, code, stdin } = await req.json();

    const languageId = languageMap[language];
    if (!languageId) {
      return new Response("Unsupported language", { status: 400 });
    }

    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: stdin,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error("Code execution error:", error);
    return new Response("An internal error occurred during code execution.", { status: 500 });
  }
}