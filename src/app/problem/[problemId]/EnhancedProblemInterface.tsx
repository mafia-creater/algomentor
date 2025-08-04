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
import EnhancedPhase4WithHiddenTests from "./Phase4";
import Phase1 from "./Phase1";
import ProblemStatement from "./ProblemStatement";
import Phase2 from "./Phase2";
import Phase3 from "./Phase3";

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

  // --- Final Summary State ---
  const [finalSummary, setFinalSummary] = useState<any>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Helper to extract code and language from initialSubmission.phase4_code
  function getInitialCode(sub: Submission | null): string {
    if (sub && sub.phase4_code && typeof sub.phase4_code === 'object' && 'code' in sub.phase4_code) {
      // @ts-ignore
      return typeof sub.phase4_code.code === 'string' ? sub.phase4_code.code : '';
    }
    return '';
  }
  function getInitialLanguage(sub: Submission | null): string {
    if (sub && sub.phase4_code && typeof sub.phase4_code === 'object' && 'language' in sub.phase4_code) {
      // @ts-ignore
      return typeof sub.phase4_code.language === 'string' ? sub.phase4_code.language : 'python';
    }
    return 'python';
  }

  // Helper to safely get code scaffold for a language
  function getCodeScaffold(scaffold: any, lang: string): string {
    if (scaffold && typeof scaffold === 'object' && lang in scaffold) {
      return typeof scaffold[lang] === 'string' ? scaffold[lang] : '';
    }
    return '';
  }

  // Track if user has edited code to avoid overwriting on language change
  const [userHasEdited, setUserHasEdited] = useState(false);

  // Initialize code and language from initialSubmission or scaffold
  useEffect(() => {
    if (initialSubmission) {
      setCode(getInitialCode(initialSubmission));
      setLanguage(getInitialLanguage(initialSubmission));
      setUserHasEdited(false);
    } else if (problem.codeScaffold) {
      setCode(getCodeScaffold(problem.codeScaffold, language));
      setUserHasEdited(false);
    } else {
      setCode('# Write your code here...');
      setUserHasEdited(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, initialSubmission]);

  // Update code scaffold only if user hasn't started editing
  useEffect(() => {
    if (!userHasEdited && problem.codeScaffold) {
      setCode(getCodeScaffold(problem.codeScaffold, language));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // When user edits code, set flag
  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    setUserHasEdited(true);
  };

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
              expectedOutput: testCase.output,
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
    setCode(getCodeScaffold(problem.codeScaffold, language));
  };

  // --- Final Summary Handler ---
  const handleGetFinalSummary = async () => {
    setIsSummaryLoading(true);
    const response = await fetch('/api/submission/phase6', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: problem.id }),
    });
    if (response.ok) {
      const data = await response.json();
      setFinalSummary(data);
    }
    setIsSummaryLoading(false);
  };

  function getFeedbackIcon(phase1Feedback: string) {
    if (!phase1Feedback) return null;
    const lower = phase1Feedback.toLowerCase();
    if (lower.includes("good") || lower.includes("well done") || lower.includes("correct")) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (lower.includes("improve") || lower.includes("try again") || lower.includes("incorrect") || lower.includes("error")) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <TestTube className="h-5 w-5 text-blue-500" />;
  }

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
          <ProblemStatement problem={problem} />

          {/* Right Panel: Dynamic Phase Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phase 1 */}
            {currentPhase === 1 && 
              <Phase1
                understanding={understanding}
                setUnderstanding={setUnderstanding}
                handleSubmit={handlePhase1Submit}
                isLoading={isPhase1Loading}
                feedback= {phase1Feedback}
              />

            }

            {/* Phase 2 */}
            {currentPhase === 2 && (
              <Phase2
                testCases={testCases}
                currentInput={currentInput}
                setCurrentInput={setCurrentInput}
                currentOutput={currentOutput}
                setCurrentOutput={setCurrentOutput}
                handleAddTestCase={handleAddTestCase}
                handleRemoveTestCase={handleRemoveTestCase}
                handleSubmit={handlePhase2Submit}
                isLoading={isPhase2Loading}
                feedback={phase2Feedback ? phase2Feedback.feedback : ''}
              />
            )}

            {/* Phase 3 */}
            {currentPhase === 3 && (
              <Phase3
                algorithmText={algorithmText}
                setAlgorithmText={setAlgorithmText}
                handleSubmit={handlePhase3Submit}
                isLoading={isPhase3Loading}
                feedback={phase3Feedback}
              />
            )}

            {/* Enhanced Phase 4 with Hidden Test Handling */}
            {currentPhase === 4 && (
              <Card className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                <CardHeader>
                  <CardTitle>Coding Interface Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="text-blue-700 font-semibold text-lg mb-2">
                    🚧 Coming Soon!
                  </div>
                  <div className="text-gray-600 text-center">
                    The coding interface is currently under maintenance.<br />
                    Please check back soon to solve this phase!
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* --- Final Summary Card (Phase 6) --- */}
            {finalSummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Problem Complete: Final Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold">Strengths</h4>
                    <p className="text-gray-600 mt-1">{finalSummary.strengths}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold">Area for Improvement</h4>
                    <p className="text-gray-600 mt-1">{finalSummary.improvementArea}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold">Suggested Problems to Practice Next</h4>
                    <ul className="list-disc list-inside text-gray-600 mt-1">
                      {finalSummary.suggestedProblems.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

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