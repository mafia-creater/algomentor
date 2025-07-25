'use client';

import { useState, useEffect } from 'react';
import type { Problem } from '@prisma/client'; // Import the real type from Prisma
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
  Play,
  RotateCcw,
  Terminal,
  Settings,
  Maximize2,
  Copy,
  Check,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor from '@monaco-editor/react';

// Types moved out or simplified as `Problem` is now from Prisma
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

// Configuration
const LANGUAGE_CONFIG = {
  python: { id: 71, name: 'Python 3', extension: 'py', monaco: 'python' },
  javascript: { id: 93, name: 'JavaScript', extension: 'js', monaco: 'javascript' },
  java: { id: 62, name: 'Java', extension: 'java', monaco: 'java' },
  cpp: { id: 54, name: 'C++', extension: 'cpp', monaco: 'cpp' },
  typescript: { id: 94, name: 'TypeScript', extension: 'ts', monaco: 'typescript' }
};

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200'
};

// The component now accepts the 'problem' prop
export default function CodingInterface({ problem }: { problem: Problem }) {
  
  // Core State
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'running' | 'accepted' | 'wrong' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('code');
  const [customInput, setCustomInput] = useState('');

  // Initialize code from scaffold when problem or language changes
  useEffect(() => {
    if (problem.codeScaffold && typeof problem.codeScaffold === 'object' && problem.codeScaffold[language]) {
      setCode(problem.codeScaffold[language]);
    }
  }, [language, problem]);

  const runCode = async (testCasesToRun?: TestCase[]) => {
    setIsRunning(true);
    setTestResults([]);
    
    // Use default test cases from the prop, or the custom ones provided
    const casesToExecute = testCasesToRun || (problem.defaultTestCases as TestCase[]) || [];
    
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
  const runCustomTest = async () => {
    if (!customInput.trim()) return;
    const customTestCase: TestCase = {
      input: customInput,
      output: 'N/A', // No expected output for custom tests
    };
    await runCode([customTestCase]);
  };
  
  // Submit final solution
  const submitSolution = async () => {
    setIsExecuting(true);
    setSubmissionStatus('running');
    await runCode(); // Runs against default test cases
    setIsExecuting(false);
  };

  const resetCode = () => {
    if (problem.codeScaffold && typeof problem.codeScaffold === 'object' && problem.codeScaffold[language]) {
        setCode(problem.codeScaffold[language]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">{problem.title}</h1>
              <Badge className={DIFFICULTY_COLORS[problem.difficulty.toLowerCase() as keyof typeof DIFFICULTY_COLORS]}>
                {problem.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-150px)]">
          {/* Left Panel - Problem Description */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader><CardTitle>Problem Description</CardTitle></CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {problem.description}
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-3">Examples:</h4>
                  {(problem.defaultTestCases as TestCase[])?.map((testCase, index) => (
                    <div key={index} className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-sm mb-2">Example {index + 1}:</p>
                      <div className="font-mono text-xs space-y-1">
                        <div><span className="font-semibold">Input:</span> {testCase.input.replace(/\n/g, ', ')}</div>
                        <div><span className="font-semibold">Output:</span> {testCase.output}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Code Editor & Tests */}
          <div className="flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="mb-2">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
                <TabsTrigger value="result">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="flex-1 mt-0">
                <div className="h-full border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    language={LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG].monaco}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{ minimap: { enabled: false } }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="test" className="flex-1 mt-0">
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Custom Test Case</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs font-medium block mb-1">Input:</label>
                        <Textarea
                          placeholder="Enter your test input..."
                          className="font-mono text-sm"
                          rows={3}
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                        />
                      </div>
                      <Button onClick={runCustomTest} disabled={!customInput.trim() || isRunning} className="w-full">
                        <Terminal className="h-4 w-4 mr-2" />
                        Run Custom Test
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="result" className="flex-1 mt-0 overflow-y-auto">
                {submissionStatus !== 'idle' && (
                   <Alert className={`mb-4 ${
                    submissionStatus === 'accepted' ? 'border-green-200 bg-green-50' :
                    submissionStatus === 'wrong' ? 'border-red-200 bg-red-50' :
                    'border-orange-200 bg-orange-50'
                  }`}>
                    <AlertDescription className="font-medium">
                      {submissionStatus === 'accepted' && '✅ Accepted! All test cases passed.'}
                      {submissionStatus === 'wrong' && '❌ Wrong Answer. Some test cases failed.'}
                      {submissionStatus === 'error' && '⚠️ Runtime or Compile Error.'}
                      {submissionStatus === 'running' && '⏳ Running tests...'}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <Card key={index}>
                      <CardHeader className="p-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Test Case {result.index}</CardTitle>
                          <Badge variant={result.isCorrect ? 'default' : 'destructive'}>
                            {result.isCorrect ? 'Passed' : 'Failed'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="font-mono text-xs space-y-2">
                          <div>
                            <span className="font-semibold">Input:</span>
                            <pre className="mt-1 p-2 bg-slate-50 rounded">{result.testCase.input}</pre>
                          </div>
                          <div>
                            <span className="font-semibold">Expected:</span>
                            <pre className="mt-1 p-2 bg-slate-50 rounded">{result.testCase.output}</pre>
                          </div>
                          <div>
                            <span className="font-semibold">Actual:</span>
                            <pre className={`mt-1 p-2 rounded ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                              {result.result.stdout || result.result.stderr || 'No output'}
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button onClick={() => runCode()} disabled={isRunning} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>
              <Button onClick={submitSolution} disabled={isExecuting || !code.trim()}>
                <Zap className="h-4 w-4 mr-2" />
                {isExecuting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}