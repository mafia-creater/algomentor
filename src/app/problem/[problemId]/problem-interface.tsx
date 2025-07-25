'use client';

import { useState, useEffect } from 'react';
// Extend Problem type locally to include codeScaffold and defaultTestCases
type Problem = {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  codeScaffold?: Record<string, string>;
  defaultTestCases?: TestCase[];
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  XCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  TestTube,
  Cog,
  Code,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Target,
  Zap,
  Play
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Editor from '@monaco-editor/react';

// Define a type for a single test case
type TestCase = { input: string; output: string };

// Configuration for each phase's display
const PHASE_CONFIG = {
  1: { title: "Understand", icon: BookOpen },
  2: { title: "Test Cases", icon: TestTube },
  3: { title: "Algorithm", icon: Cog },
  4: { title: "Code", icon: Code }
};

// Helper function for difficulty badge color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function ProblemInterface({ problem }: { problem: Problem }) {
  // --- Core State ---
  const [currentPhase, setCurrentPhase] = useState(1);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  const progressPercentage = (completedPhases.size / Object.keys(PHASE_CONFIG).length) * 100;

  // --- Phase 1 State ---
  const [understanding, setUnderstanding] = useState('');
  const [phase1Feedback, setPhase1Feedback] = useState('');
  const [isPhase1Loading, setIsPhase1Loading] = useState(false);
  
  // --- Phase 2 State ---
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [phase2Feedback, setPhase2Feedback] = useState<{ feedback: string, suggestedEdgeCases: string[] } | null>(null);
  const [isPhase2Loading, setIsPhase2Loading] = useState(false);
  
  // --- Phase 3 State ---
  const [algorithmText, setAlgorithmText] = useState('');
  const [phase3Feedback, setPhase3Feedback] = useState('');
  const [isPhase3Loading, setIsPhase3Loading] = useState(false);

  // --- Phase 4 State ---
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your code here...');
  // Set initial code from scaffold when problem or language changes
  useEffect(() => {
    if (
      problem.codeScaffold &&
      typeof problem.codeScaffold === 'object' &&
      typeof (problem.codeScaffold as Record<string, string>)[language] === 'string'
    ) {
      setCode((problem.codeScaffold as Record<string, string>)[language]);
    } else {
      setCode('# Write your code here...');
    }
  }, [problem, language]);
  const [isExecuting, setIsExecuting] = useState(false);
  // New: Store results for each test case run
  type RunResult = {
    testCase: { input: string; output: string };
    result: any;
    isCorrect: boolean;
  };
  const [runResults, setRunResults] = useState<RunResult[]>([]);

  // --- Navigation and State Logic ---
  const markPhaseCompleted = (phase: number) => {
    setCompletedPhases(prev => new Set(prev).add(phase));
  };

  const goToPhase = (phase: number) => {
    // Allow navigation only to completed phases or the current phase
    if (completedPhases.has(phase) || phase === currentPhase) {
      setCurrentPhase(phase);
    }
  };

  const goToNextPhase = () => {
    if (currentPhase < Object.keys(PHASE_CONFIG).length) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const goToPreviousPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  // --- API Handlers ---
  const handlePhase1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPhase1Loading(true);
    setPhase1Feedback('');
    const response = await fetch('/api/submission/phase1', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: problem.id, userText: understanding }),
    });
    setIsPhase1Loading(false);
    if (response.ok) {
      const data = await response.json();
      setPhase1Feedback(data.feedback);
      markPhaseCompleted(1);
    } else {
      setPhase1Feedback('Error: Could not get AI feedback.');
    }
  };

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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: problem.id, testCases }),
    });
    setIsPhase2Loading(false);
    if (response.ok) {
      const data = await response.json();
      setPhase2Feedback(data);
      markPhaseCompleted(2);
    }
  };

  const handlePhase3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPhase3Loading(true);
    setPhase3Feedback('');
    const response = await fetch('/api/submission/phase3', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: problem.id, algorithmText }),
    });
    setIsPhase3Loading(false);
    if (response.ok) {
      const data = await response.json();
      setPhase3Feedback(data.feedback);
      markPhaseCompleted(3);
    } else {
      setPhase3Feedback('Error: Could not get AI feedback.');
    }
  };

  // New: Run code against all test cases and show results
  const handleSubmitAndRunTests = async () => {
    setIsExecuting(true);
    setRunResults([]);

    // Combine default and custom test cases
    const allTestCases = Array.isArray(problem.defaultTestCases)
      ? [...problem.defaultTestCases, ...testCases]
      : [...testCases];

    const executionPromises = allTestCases.map(tc =>
      fetch('/api/submission/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, stdin: tc.input }),
      }).then(res => res.json())
    );

    // Wait for all executions to complete
    const results = await Promise.all(executionPromises);

    // Process the results
    const processedResults = results.map((result, index) => {
      const testCase = allTestCases[index];
      const actualOutput = (result.stdout || "").trim();
      const expectedOutput = testCase.output.trim();
      return {
        testCase,
        result,
        isCorrect: actualOutput === expectedOutput,
      };
    });

    setRunResults(processedResults);
    setIsExecuting(false);

    // Check if all test cases passed to potentially move to the next phase
    const allPassed = processedResults.every(r => r.isCorrect);
    if (allPassed) {
      markPhaseCompleted(4);
      // Here we would trigger the call to the Phase 5 AI analysis
      console.log("All tests passed! Ready for Phase 5 analysis.");
    }
  };
  
  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4">
          {/* Title and Progress Bar */}
          <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
          <Badge className={`${getDifficultyColor(problem.difficulty)} mt-2`}>{problem.difficulty}</Badge>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          {/* Phase Navigation */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {Object.entries(PHASE_CONFIG).map(([phase, config]) => {
              const phaseNum = parseInt(phase);
              const isActive = phaseNum === currentPhase;
              const isCompleted = completedPhases.has(phaseNum);
              const Icon = config.icon;
              return (
                <div key={phase} className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => goToPhase(phaseNum)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${isActive ? 'bg-blue-50 border-blue-200 text-blue-700' : isCompleted ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    <span>{config.title}</span>
                  </button>
                  {phaseNum < Object.keys(PHASE_CONFIG).length && <ChevronRight className="h-4 w-4 text-gray-300" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel: Problem Statement */}
          <div className="lg:col-span-1">
            <Card className="sticky top-48 shadow-sm">
              <CardHeader><CardTitle>Problem Statement</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{problem.description}</p>
                {/* Default test cases/examples */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Examples</h4>
                  {(problem.defaultTestCases as TestCase[])?.map((tc, index) => (
                    <div key={index} className="text-sm p-3 bg-secondary rounded-md font-mono mb-2">
                      <p className="font-semibold">Example {index + 1}:</p>
                      <p>Input: {tc.input}</p>
                      <p>Output: {tc.output}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Dynamic Phase Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phase 1 */}
            {currentPhase === 1 && (
              <Card>
                <CardHeader><CardTitle>Phase 1: Understand the Problem</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handlePhase1Submit} className="space-y-4">
                    <Textarea placeholder="Explain the inputs, outputs, and constraints..." className="min-h-[200px]" value={understanding} onChange={(e) => setUnderstanding(e.target.value)} />
                    <Button type="submit" disabled={isPhase1Loading} className="w-full">{isPhase1Loading ? 'Evaluating...' : 'Get AI Feedback'}</Button>
                  </form>
                  {phase1Feedback && <Alert className="mt-4"><AlertDescription>{phase1Feedback}</AlertDescription></Alert>}
                </CardContent>
              </Card>
            )}

            {/* Phase 2 */}
            {currentPhase === 2 && (
              <Card>
                <CardHeader><CardTitle>Phase 2: Create Custom Test Cases</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {testCases.map((tc, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                        <div className="flex-1 text-sm font-mono">Input: {tc.input} | Output: {tc.output}</div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTestCase(i)}><XCircle className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Input" value={currentInput} onChange={e => setCurrentInput(e.target.value)} />
                    <Input placeholder="Output" value={currentOutput} onChange={e => setCurrentOutput(e.target.value)} />
                  </div>
                  <Button onClick={handleAddTestCase} variant="outline" className="mt-2 w-full">Add Test Case</Button>
                  <Separator className="my-4" />
                  <Button onClick={handlePhase2Submit} className="w-full" disabled={testCases.length === 0 || isPhase2Loading}>{isPhase2Loading ? 'Evaluating...' : 'Submit Test Cases'}</Button>
                  {phase2Feedback && <Alert className="mt-4"><AlertDescription>{phase2Feedback.feedback}</AlertDescription>{/* You can also map over suggestedEdgeCases here */}</Alert>}
                </CardContent>
              </Card>
            )}
            
            {/* Phase 3 */}
            {currentPhase === 3 && (
              <Card>
                <CardHeader><CardTitle>Phase 3: Design the Algorithm</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handlePhase3Submit} className="space-y-4">
                    <Textarea placeholder="1. Initialize a hash map..." className="min-h-[250px]" value={algorithmText} onChange={(e) => setAlgorithmText(e.target.value)} />
                    <Button type="submit" disabled={isPhase3Loading} className="w-full">{isPhase3Loading ? 'Evaluating...' : 'Submit Algorithm'}</Button>
                  </form>
                  {phase3Feedback && <Alert className="mt-4"><AlertDescription>{phase3Feedback}</AlertDescription></Alert>}
                </CardContent>
              </Card>
            )}

            {/* Phase 4 */}
            {currentPhase === 4 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Phase 4: Code the Solution</CardTitle>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Editor height="50vh" language={language} theme="vs-dark" value={code} onChange={(v) => setCode(v || '')} />
                  <Button onClick={handleSubmitAndRunTests} className="mt-4 w-full" disabled={isExecuting}>{isExecuting ? 'Executing...' : 'Submit & Run All Tests'}</Button>
                  {runResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-bold">Test Results</h3>
                      {runResults.map((run, index) => (
                        <Card key={index}>
                          <CardHeader className="flex flex-row justify-between items-center p-4">
                            <CardTitle className="text-sm">Test Case {index + 1}</CardTitle>
                            <Badge variant={run.isCorrect ? 'default' : 'destructive'}>
                              {run.isCorrect ? 'Passed' : 'Failed'}
                            </Badge>
                          </CardHeader>
                          <CardContent className="p-4 text-xs font-mono bg-secondary rounded-b-md">
                            <p>Input: {run.testCase.input}</p>
                            <p>Expected: {run.testCase.output}</p>
                            <p>Actual: {(run.result.stdout || "").trim() || (run.result.stderr || "Execution Error")}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" onClick={goToPreviousPhase} disabled={currentPhase === 1}><ArrowLeft className="h-4 w-4 mr-2" /> Previous</Button>
              {completedPhases.has(currentPhase) && currentPhase < 4 && (
                  <Button onClick={goToNextPhase}><ArrowRight className="h-4 w-4 mr-2" /> Next Phase</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}