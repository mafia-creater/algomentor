'use client';

import { useState } from 'react';
import type { Problem } from '@prisma/client'; // Import the Problem type from Prisma
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// This component receives the problem as a prop
export default function ProblemInterface({ problem }: { problem: Problem }) {
  const [understanding, setUnderstanding] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAiFeedback('');

    const response = await fetch('/api/submission/phase1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        userText: understanding,
      }),
    });

    setIsLoading(false);
    if (response.ok) {
      const data = await response.json();
      setAiFeedback(data.feedback);
    } else {
      setAiFeedback('Error: Could not get feedback from AI.');
    }
  };

  return (
    <div className="container mx-auto p-4 grid md:grid-cols-2 gap-8">
      {/* Problem Statement Section */}
      <Card>
        <CardHeader>
          <CardTitle>{problem.title}</CardTitle>
          <CardDescription>
            Difficulty: {problem.difficulty}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{problem.description}</p>
        </CardContent>
      </Card>

      {/* Phase 1: User Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 1: Understand the Problem</CardTitle>
          <CardDescription>
            In your own words, describe the requirements, inputs, and expected outputs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Describe the problem's core requirements here..."
              className="min-h-[200px]"
              value={understanding}
              onChange={(e) => setUnderstanding(e.target.value)}
            />
            <Button className="mt-4" type="submit" disabled={isLoading}>
              {isLoading ? 'Evaluating...' : 'Submit Understanding'}
            </Button>
          </form>
          {aiFeedback && (
            <div className="mt-4 p-4 bg-secondary rounded-md">
              <h3 className="font-bold">AI Feedback</h3>
              <p className="text-sm">{aiFeedback}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}