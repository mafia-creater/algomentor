"use client";
import React, { useEffect, useState } from "react";
import type { Problem, Submission } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  XCircle,
  CheckCircle2,
  BookOpen,
  TestTube,
  Cog,
  Code,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Zap,
  Play,
  Terminal,
  RotateCcw
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor from '@monaco-editor/react';
import EnhancedPhase4 from "./Phase4";

type TestCase = {
  input: string;
  output: string;
  explanation?: string;
  isHidden?: boolean;
};

type ExecutionResult = {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
};

type TestResult = {
  testCase: TestCase;
  result: ExecutionResult;
  isCorrect: boolean;
  executionTime: number;
  memoryUsed: number;
  index: number;
};

const LANGUAGE_CONFIG = {
  python: { id: 71, name: 'Python 3', extension: 'py', monaco: 'python' },
  javascript: { id: 93, name: 'JavaScript', extension: 'js', monaco: 'javascript' },
  java: { id: 62, name: 'Java', extension: 'java', monaco: 'java' },
  cpp: { id: 54, name: 'C++', extension: 'cpp', monaco: 'cpp' },
  typescript: { id: 94, name: 'TypeScript', extension: 'ts', monaco: 'typescript' }
};

const PHASE_CONFIG = {
  1: { title: "Understand", icon: BookOpen },
  2: { title: "Test Cases", icon: TestTube },
  3: { title: "Algorithm", icon: Cog },
  4: { title: "Code", icon: Code }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function EnhancedProblemInterface({ problem, initialSubmission }: { problem: Problem; initialSubmission?: Submission | null }) {
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

  // --- Enhanced Phase 4 State ---
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'running' | 'accepted' | 'wrong' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('code');
  const [customInput, setCustomInput] = useState('');

  // Initialize code from scaffold when problem or language changes, or from initialSubmission
  useEffect(() => {
    if (initialSubmission && typeof initialSubmission.code === 'string') {
      setCode(initialSubmission.code);
    } else if (
      problem.codeScaffold &&
      typeof problem.codeScaffold === 'object' &&
      typeof (problem.codeScaffold as Record<string, string>)[language] === 'string'
    ) {
      setCode((problem.codeScaffold as Record<string, string>)[language]);
    } else {
      setCode('# Write your code here...');
    }
    if (initialSubmission && typeof initialSubmission.language === 'string') {
      setLanguage(initialSubmission.language);
    }
  }, [problem, language, initialSubmission]);

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

  // --- API Handlers for Phases 1-3 ---
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

  // --- Enhanced Phase 4 Code Execution ---
  const runCode = async (testCasesToRun?: TestCase[]) => {
    setIsRunning(true);
    setTestResults([]);

    // Use default test cases from the prop, or the custom ones provided
    const casesToExecute = testCasesToRun || [
      ...(problem.defaultTestCases as TestCase[] || []),
      ...testCases
    ];

    try {
      const results = await Promise.all(
        casesToExecute.map(async (testCase, index) => {
          const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language,
              code,
              stdin: testCase.input,
              functionName: problem.functionName
            })
          });

          const result = await response.json();
          const actualOutput = (result.stdout || '').trim();
          const expectedOutput = testCase.output.trim();

          return {
            testCase,
            result,
            isCorrect: actualOutput === expectedOutput && result.status.id === 3, // 3 is "Accepted" in Judge0
            executionTime: parseFloat(result.time || '0'),
            memoryUsed: result.memory || 0,
            index: index + 1
          };
        })
      );

      setTestResults(results);

      const allPassed = results.every(r => r.isCorrect);
      const hasErrors = results.some(r => r.result.status.id > 3); // Any status > 3 is an error

      if (hasErrors) {
        setSubmissionStatus('error');
      } else if (allPassed) {
        setSubmissionStatus('accepted');
        markPhaseCompleted(4);
      } else {
        setSubmissionStatus('wrong');
      }

    } catch (error) {
      console.error('Execution error:', error);
      setSubmissionStatus('error');
    } finally {
      setIsRunning(false);
      setActiveTab('result'); // Switch to results tab after running
    }
  };

  // Run with custom input
  // Run with custom input
  // --- Remove duplicate useEffect ---

  // Custom test runner for Phase 4 "Test" tab
  const runCustomTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          stdin: customInput,
          functionName: problem.functionName
        })
      });
      const result = await response.json();
      const actualOutput = (result.stdout || '').trim();
      setTestResults([{
        testCase: { input: customInput, output: '', explanation: '', isHidden: false },
        result,
        isCorrect: true, // Custom test doesn't compare output
        executionTime: parseFloat(result.time || '0'),
        memoryUsed: result.memory || 0,
        index: 1
      }]);
      setSubmissionStatus(result.status.id === 3 ? 'accepted' : 'error');
    } catch (error) {
      setSubmissionStatus('error');
    } finally {
      setIsRunning(false);
      setActiveTab('result');
    }
  };

  // Submit final solution
  const submitSolution = async () => {
    setIsExecuting(true);
    setSubmissionStatus('running');
    await runCode(); // Runs against all test cases
    setIsExecuting(false);
  };

  const resetCode = () => {
    if (problem.codeScaffold && typeof problem.codeScaffold === 'object' && problem.codeScaffold[language]) {
      setCode(problem.codeScaffold[language]);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          {/* Title and Progress Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
              <Badge className={`${getDifficultyColor(problem.difficulty)} mt-2`}>{problem.difficulty}</Badge>
            </div>
            {/* Language selector - only show in Phase 4 */}
            {currentPhase === 4 && (
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

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
                  <button
                    onClick={() => goToPhase(phaseNum)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : isCompleted
                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                          : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    disabled={!isCompleted && phaseNum !== currentPhase}
                  >
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
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {problem.description}
                </div>
                {/* Default test cases/examples */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-sm">Examples:</h4>
                  {(problem.defaultTestCases as TestCase[])?.map((tc, index) => (
                    <div key={index} className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-sm mb-2">Example {index + 1}:</p>
                      <div className="font-mono text-xs space-y-1">
                        <div><span className="font-semibold">Input:</span> {tc.input.replace(/\n/g, ', ')}</div>
                        <div><span className="font-semibold">Output:</span> {tc.output}</div>
                      </div>
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
                    <Textarea
                      placeholder="Explain the inputs, outputs, and constraints..."
                      className="min-h-[200px]"
                      value={understanding}
                      onChange={(e) => setUnderstanding(e.target.value)}
                    />
                    <Button type="submit" disabled={isPhase1Loading} className="w-full">
                      {isPhase1Loading ? 'Evaluating...' : 'Submit Explanation'}
                    </Button>
                  </form>
                  {phase1Feedback && (
                    <Alert className="mt-4">
                      <AlertDescription>{phase1Feedback}</AlertDescription>
                    </Alert>
                  )}
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
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTestCase(i)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Input"
                      value={currentInput}
                      onChange={e => setCurrentInput(e.target.value)}
                    />
                    <Input
                      placeholder="Output"
                      value={currentOutput}
                      onChange={e => setCurrentOutput(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddTestCase} variant="outline" className="mt-2 w-full">
                    Add Test Case
                  </Button>
                  <Separator className="my-4" />
                  <Button
                    onClick={handlePhase2Submit}
                    className="w-full"
                    disabled={testCases.length === 0 || isPhase2Loading}
                  >
                    {isPhase2Loading ? 'Evaluating...' : 'Submit Test Cases'}
                  </Button>
                  {phase2Feedback && (
                    <Alert className="mt-4">
                      <AlertDescription>{phase2Feedback.feedback}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Phase 3 */}
            {currentPhase === 3 && (
              <Card>
                <CardHeader><CardTitle>Phase 3: Design the Algorithm</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handlePhase3Submit} className="space-y-4">
                    <Textarea
                      placeholder="1. Initialize a hash map..."
                      className="min-h-[250px]"
                      value={algorithmText}
                      onChange={(e) => setAlgorithmText(e.target.value)}
                    />
                    <Button type="submit" disabled={isPhase3Loading} className="w-full">
                      {isPhase3Loading ? 'Evaluating...' : 'Submit Algorithm'}
                    </Button>
                  </form>
                  {phase3Feedback && (
                    <Alert className="mt-4">
                      <AlertDescription>{phase3Feedback}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Enhanced Phase 4 */}
            {currentPhase === 4 && (
            <EnhancedPhase4
              problem={problem}
              language={language}
              setLanguage={setLanguage}
              code={code}
              setCode={setCode}
              testCases={testCases} // Pass down the custom test cases from Phase 2
              markPhaseCompleted={markPhaseCompleted}
              initialSubmission={initialSubmission}
            />)}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={goToPreviousPhase}
                disabled={currentPhase === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              {completedPhases.has(currentPhase) && currentPhase < 4 && (
                <Button onClick={goToNextPhase}>
                  Next Phase <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}