// src/app/api/problem/[problemId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { problemId: string } }) {
  const problem = await prisma.problem.findUnique({
    where: { id: parseInt(params.problemId) },
  });
  return NextResponse.json({ problem });
}