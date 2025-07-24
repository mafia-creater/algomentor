'use client';

import { useState, useEffect } from 'react';
import type { Problem } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { XCircle } from 'lucide-react';

// Define a type for a single test case
type TestCase = { input: string; output: string };

export default function ProblemInterface({ problem }: { problem: Problem }) {
  // State for tracking the user's overall submission progress
  const [submission, setSubmission] = useState<{ currentPhase: number } | null>(null);

  // --- States for Phase 1 ---
  const [understanding, setUnderstanding] = useState('');
  const [phase1Feedback, setPhase1Feedback] = useState('');
  const [isPhase1Loading, setIsLoading] = useState(false);
  
  // --- States for Phase 2 ---
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [phase2Feedback, setPhase2Feedback] = useState<{ feedback: string, suggestedEdgeCases: string[] } | null>(null);
  const [isPhase2Loading, setIsPhase2Loading] = useState(false);
  

  // --- States for Phase 3 ---
  const [algorithmText, setAlgorithmText] = useState('');
  const [phase3Feedback, setPhase3Feedback] = useState('');
  const [isPhase3Loading, setIsPhase3Loading] = useState(false);

  // TODO: In a real app, you would fetch the user's existing submission from the DB here.
  // For now, we'll initialize to Phase 1.
  useEffect(() => {
    setSubmission({ currentPhase: 1 });
  }, []);
  // --- Handler for Phase 3 ---
  const handlePhase3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPhase3Loading(true);
    setPhase3Feedback('');

    const response = await fetch('/api/submission/phase3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        algorithmText: algorithmText,
      }),
    });

    setIsPhase3Loading(false);
    if (response.ok) {
      const data = await response.json();
      setPhase3Feedback(data.feedback);
      // After a short delay, move to the next phase
      setTimeout(() => setSubmission({ currentPhase: 4 }), 3000);
    } else {
      setPhase3Feedback('Error: Could not get feedback from AI.');
    }
  };

  // --- Handlers for Phase 1 ---
  const handlePhase1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPhase1Feedback('');

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
      setPhase1Feedback(data.feedback);
      // After a short delay, move to the next phase
      setTimeout(() => setSubmission({ currentPhase: 2 }), 3000);
    } else {
      setPhase1Feedback('Error: Could not get feedback from AI.');
    }
  };

  // --- Handlers for Phase 2 ---
  const handleAddTestCase = () => {
    if (currentInput.trim() && currentOutput.trim()) {
      setTestCases([...testCases, { input: currentInput, output: currentOutput }]);
      setCurrentInput('');
      setCurrentOutput('');
    }
  };
  
  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };
  
  const handlePhase2Submit = async () => {
    setIsPhase2Loading(true);
    setPhase2Feedback(null);
    
    const response = await fetch('/api/submission/phase2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        testCases: testCases,
      }),
    });

    setIsPhase2Loading(false);
    if (response.ok) {
      const data = await response.json();
      setPhase2Feedback(data);
      // After a short delay, move to the next phase
      setTimeout(() => setSubmission({ currentPhase: 3 }), 5000);
    }
  };

  if (!submission) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 grid md:grid-cols-2 gap-8">
      {/* Problem Statement Card (Static) */}
      <Card>
        <CardHeader>
          <CardTitle>{problem.title}</CardTitle>
          <CardDescription>Difficulty: {problem.difficulty}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{problem.description}</p>
        </CardContent>
      </Card>

      {/* Dynamic Card for Current Phase */}
      <div>
        {submission.currentPhase === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Phase 1: Understand the Problem</CardTitle>
              <CardDescription>
                In your own words, describe the requirements, inputs, and expected outputs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhase1Submit}>
                <Textarea
                  placeholder="Describe the problem's core requirements here..."
                  className="min-h-[200px]"
                  value={understanding}
                  onChange={(e) => setUnderstanding(e.target.value)}
                />
                <Button className="mt-4" type="submit" disabled={isPhase1Loading}>
                  {isPhase1Loading ? 'Evaluating...' : 'Submit Understanding'}
                </Button>
              </form>
              {phase1Feedback && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-bold">AI Feedback</h3>
                  <p className="text-sm">{phase1Feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {submission.currentPhase === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Phase 2: Create Test Cases</CardTitle>
              <CardDescription>
                Provide sample inputs and their expected outputs. Include edge cases!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {testCases.map((tc, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                    <div className="flex-1">
                      <p className="text-xs font-semibold">Input: <span className="font-mono bg-background p-1 rounded">{tc.input}</span></p>
                      <p className="text-xs font-semibold mt-1">Output: <span className="font-mono bg-background p-1 rounded">{tc.output}</span></p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveTestCase(index)}>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            
              <div className="flex flex-col sm:flex-row gap-2">
                <Input placeholder="Sample Input" value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                <Input placeholder="Expected Output" value={currentOutput} onChange={e => setCurrentOutput(e.target.value)} />
              </div>
              <Button onClick={handleAddTestCase} variant="outline" className="mt-2 w-full">Add Test Case</Button>
              
              <hr className="my-4" />
              
              <Button onClick={handlePhase2Submit} className="w-full" disabled={testCases.length === 0 || isPhase2Loading}>
                {isPhase2Loading ? 'Evaluating...' : 'Submit Test Cases for Review'}
              </Button>

              {phase2Feedback && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-bold">AI Feedback</h3>
                  <p className="text-sm whitespace-pre-wrap">{phase2Feedback.feedback}</p>
                  {phase2Feedback.suggestedEdgeCases?.length > 0 && (
                    <>
                      <h4 className="font-semibold mt-2 text-sm">Suggested Edge Cases:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {phase2Feedback.suggestedEdgeCases.map((edgeCase: string, index: number) => (
                          <li key={index}>{edgeCase}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {submission.currentPhase === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Phase 3: Design the Algorithm</CardTitle>
              <CardDescription>
                Write down the step-by-step logic for your solution in plain English.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhase3Submit}>
                <Textarea
                  placeholder={"1. Initialize a variable...\n2. Loop through the array...\n3. If a condition is met..."}
                  className="min-h-[250px] font-mono"
                  value={algorithmText}
                  onChange={(e) => setAlgorithmText(e.target.value)}
                />
                <Button className="mt-4" type="submit" disabled={isPhase3Loading}>
                  {isPhase3Loading ? 'Evaluating...' : 'Submit Algorithm'}
                </Button>
              </form>
              {phase3Feedback && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-bold">AI Feedback</h3>
                  <p className="text-sm whitespace-pre-wrap">{phase3Feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {submission.currentPhase === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Phase 4 Coming Soon!</CardTitle>
              <CardDescription>
                Great! Now it's time to code your solution.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}