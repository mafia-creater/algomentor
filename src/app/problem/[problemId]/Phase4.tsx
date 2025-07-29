// Enhanced Phase 4 Component with proper hidden test case handling
"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  XCircle,
  CheckCircle2,
  Clock,
  MemoryStick,
  Play,
  Send,
  RotateCcw,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Target,
  Zap,
} from 'lucide-react';
import Editor from '@monaco-editor/react';

type TestCase = {
  input: string;
  output: string;
  explanation?: string;
  isHidden: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  memoryLimit?: number;
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
  execution_time?: string;
  memory_usage?: number;
};

type TestResult = {
  testCase: TestCase;
  result: ExecutionResult;
  isCorrect: boolean;
  executionTime: number;
  memoryUsed: number;
  index: number;
  error?: string;
  isHidden: boolean;
};

type SubmissionResult = {
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded' | 'compilation_error' | 'system_error';
  totalTests: number;
  publicTests: number;
  hiddenTests: number;
  passedPublic: number;
  passedHidden: number;
  passedTests: number;
  failedTestIndex?: number;
  failedTestType?: 'public' | 'hidden';
  runtime: number;
  memory: number;
  testResults?: TestResult[];
  message?: string;
  acceptanceDetails?: {
    publicAccepted: boolean;
    hiddenAccepted: boolean;
    firstFailedHidden?: number;
  };
};

const LANGUAGE_CONFIG = {
  python: { id: 71, name: 'Python 3', extension: 'py', monaco: 'python' },
  javascript: { id: 93, name: 'JavaScript', extension: 'js', monaco: 'javascript' },
  java: { id: 62, name: 'Java', extension: 'java', monaco: 'java' },
  cpp: { id: 54, name: 'C++', extension: 'cpp', monaco: 'cpp' },
  typescript: { id: 94, name: 'TypeScript', extension: 'ts', monaco: 'typescript' }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
    case 'wrong answer': 
    case 'wrong_answer': return 'text-red-600 bg-red-50 border-red-200';
    case 'runtime error': 
    case 'runtime_error': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'time limit exceeded': 
    case 'time_limit_exceeded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'compilation error': 
    case 'compilation_error': return 'text-purple-600 bg-purple-50 border-purple-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status: string, isCorrect: boolean) => {
  if (isCorrect) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status.toLowerCase().includes('error')) return <XCircle className="h-4 w-4 text-red-600" />;
  if (status.toLowerCase().includes('time')) return <Clock className="h-4 w-4 text-yellow-600" />;
  return <AlertCircle className="h-4 w-4 text-gray-600" />;
};

interface Phase4Props {
  problem: any;
  language: string;
  setLanguage: (lang: string) => void;
  code: string;
  setCode: (code: string) => void;
  markPhaseCompleted: (phase: number) => void;
  initialSubmission?: any;
}

export default function EnhancedPhase4WithHiddenTests({ 
  problem, 
  language, 
  setLanguage, 
  code, 
  setCode, 
  markPhaseCompleted,
  initialSubmission 
}: Phase4Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [activeTab, setActiveTab] = useState('code');
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [showHiddenTests, setShowHiddenTests] = useState(false);
  // --- NEW STATE FOR AI COMPLEXITY ANALYSIS ---
  const [complexityAnalysis, setComplexityAnalysis] = useState<any>(null);

  // Get public test cases (shown during "Run")
  const getPublicTestCases = (): TestCase[] => {
    const publicTests = problem.defaultTestCases || [];
    return publicTests.map((test: any) => ({
      ...test,
      isHidden: false
    }));
  };

  // Get hidden test cases (used only during submission)
  const getHiddenTestCases = (): TestCase[] => {
    const hiddenTests = problem.hiddenTestCases || [];
    return hiddenTests.map((test: any) => ({
      ...test,
      isHidden: true
    }));
  };

  // Get all test cases for submission
  const getAllTestCases = (): TestCase[] => {
    const publicTests = getPublicTestCases();
    const hiddenTests = getHiddenTestCases();
    return [...publicTests, ...hiddenTests];
  };

  // Reset code to scaffold
  const resetCode = () => {
    if (problem.codeScaffold && typeof problem.codeScaffold === 'object') {
      const scaffold = (problem.codeScaffold as Record<string, string>)[language];
      if (scaffold) {
        setCode(scaffold);
      }
    }
  };

  // Format execution output for comparison
  const formatOutput = (output: string): string => {
    if (!output) return '';
    return output.trim().replace(/\s+/g, ' ');
  };

  // Execute code against specific test cases
  const executeTestCases = async (testCasesToRun: TestCase[], isSubmission = false): Promise<TestResult[]> => {
    const results = await Promise.all(
      testCasesToRun.map(async (testCase, index) => {
        try {
          const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language,
              code,
              stdin: testCase.input,
              functionName: problem.functionName,
              timeLimit: testCase.timeLimit,
              memoryLimit: testCase.memoryLimit
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          // Handle execution errors
          if (result.error) {
            return {
              testCase,
              result,
              isCorrect: false,
              executionTime: 0,
              memoryUsed: 0,
              index: index + 1,
              error: result.error,
              isHidden: testCase.isHidden
            };
          }
          
          const actualOutput = formatOutput(result.stdout || '');
          const expectedOutput = formatOutput(testCase.output);
          const isCorrect = actualOutput === expectedOutput && result.status.id === 3;
          
          return {
            testCase,
            result,
            isCorrect,
            executionTime: parseFloat(result.time || result.execution_time || '0'),
            memoryUsed: result.memory || result.memory_usage || 0,
            index: index + 1,
            error: result.stderr || result.compile_output || undefined,
            isHidden: testCase.isHidden
          };
        } catch (error) {
          return {
            testCase,
            result: {
              stdout: '',
              stderr: error instanceof Error ? error.message : 'Unknown error',
              compile_output: '',
              status: { id: 6, description: 'System Error' },
              time: '0',
              memory: 0
            },
            isCorrect: false,
            executionTime: 0,
            memoryUsed: 0,
            index: index + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
            isHidden: testCase.isHidden
          };
        }
      })
    );
    
    return results;
  };

  // Run code against public test cases only
  const runCode = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSubmissionResult(null);
    setActiveTab('result');
    
    const publicTests = getPublicTestCases();
    if (publicTests.length === 0) {
      setTestResults([]);
      setIsRunning(false);
      return;
    }
    
    try {
      const results = await executeTestCases(publicTests, false);
      setTestResults(results);
      
    } catch (error) {
      console.error('Execution error:', error);
      setTestResults([{
        testCase: { input: '', output: '', isHidden: false },
        result: {
          stdout: '',
          stderr: error instanceof Error ? error.message : 'System error occurred',
          compile_output: '',
          status: { id: 6, description: 'System Error' },
          time: '0',
          memory: 0
        },
        isCorrect: false,
        executionTime: 0,
        memoryUsed: 0,
        index: 1,
        error: error instanceof Error ? error.message : 'System error occurred',
        isHidden: false
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit solution (run against all test cases including hidden)
  const submitSolution = async () => {
    setIsSubmitting(true);
    setTestResults([]);
    setSubmissionResult(null);
    setComplexityAnalysis(null); // Clear previous analysis
    setActiveTab('result');
    const allTests = getAllTestCases();
    const publicTests = getPublicTestCases();
    const hiddenTests = getHiddenTestCases();
    try {
      const results = await executeTestCases(allTests, true);
      // Separate results by type
      const publicResults = results.slice(0, publicTests.length);
      const hiddenResults = results.slice(publicTests.length);
      // Calculate statistics
      const passedPublic = publicResults.filter(r => r.isCorrect).length;
      const passedHidden = hiddenResults.filter(r => r.isCorrect).length;
      const passedTests = passedPublic + passedHidden;
      const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
      const maxMemory = Math.max(...results.map(r => r.memoryUsed));
      // Determine submission status
      let status: SubmissionResult['status'] = 'accepted';
      let failedTestIndex: number | undefined;
      let failedTestType: 'public' | 'hidden' | undefined;
      let message: string | undefined;
      // Check for compilation errors first
      const hasCompilationError = results.some(r => 
        r.result.status.id === 6 || r.result.status.description.toLowerCase().includes('compilation')
      );
      if (hasCompilationError) {
        status = 'compilation_error';
        message = 'Compilation Error';
      } else {
        // Check public test cases first
        const firstFailedPublic = publicResults.find(r => !r.isCorrect);
        if (firstFailedPublic) {
          failedTestIndex = firstFailedPublic.index;
          failedTestType = 'public';
          if (firstFailedPublic.result.status.id === 5) {
            status = 'time_limit_exceeded';
            message = 'Time Limit Exceeded on Public Test';
          } else if (firstFailedPublic.result.status.id >= 7) {
            status = 'runtime_error';
            message = 'Runtime Error on Public Test';
          } else {
            status = 'wrong_answer';
            message = `Wrong Answer - Failed on public test case ${failedTestIndex}`;
          }
        } else {
          // All public tests passed, check hidden tests
          const firstFailedHidden = hiddenResults.find(r => !r.isCorrect);
          if (firstFailedHidden) {
            failedTestIndex = firstFailedHidden.index + publicTests.length;
            failedTestType = 'hidden';
            if (firstFailedHidden.result.status.id === 5) {
              status = 'time_limit_exceeded';
              message = 'Time Limit Exceeded on Hidden Test';
            } else if (firstFailedHidden.result.status.id >= 7) {
              status = 'runtime_error';
              message = 'Runtime Error on Hidden Test';
            } else {
              status = 'wrong_answer';
              message = `Wrong Answer - Failed on hidden test case`;
            }
          } else {
            // All tests passed!
            status = 'accepted';
            message = 'Accepted! All test cases passed.';
            // --- NEW PART: Mark phase completed and call phase 5 API for complexity analysis ---
            markPhaseCompleted(4);
            try {
              const analysisResponse = await fetch('/api/submission/phase5', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problemId: problem.id, code, language }),
              });
              if (analysisResponse.ok) {
                const analysisData = await analysisResponse.json();
                setComplexityAnalysis(analysisData);
              }
            } catch (err) {
              // Optionally handle error for analysis
            }
          }
        }
      }
      const submissionResult: SubmissionResult = {
        status,
        totalTests: allTests.length,
        publicTests: publicTests.length,
        hiddenTests: hiddenTests.length,
        passedPublic,
        passedHidden,
        passedTests,
        failedTestIndex,
        failedTestType,
        runtime: totalTime,
        memory: maxMemory,
        testResults: results,
        message,
        acceptanceDetails: {
          publicAccepted: passedPublic === publicTests.length,
          hiddenAccepted: passedHidden === hiddenTests.length,
          firstFailedHidden: failedTestType === 'hidden' ? failedTestIndex : undefined
        }
      };
      setSubmissionResult(submissionResult);
      // For display, show all public results + limited hidden results
      // Show hidden results only up to first failure or first few if all pass
      let displayResults = [...publicResults];
      if (status === 'accepted') {
        // Show first 2-3 hidden test results when accepted
        displayResults = [...displayResults, ...hiddenResults.slice(0, 3)];
      } else if (failedTestType === 'hidden') {
        // Show hidden results up to the first failure
        const failedHiddenIndex = hiddenResults.findIndex(r => !r.isCorrect);
        displayResults = [...displayResults, ...hiddenResults.slice(0, failedHiddenIndex + 1)];
      }
      setTestResults(displayResults);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionResult({
        status: 'system_error',
        totalTests: allTests.length,
        publicTests: publicTests.length,
        hiddenTests: hiddenTests.length,
        passedPublic: 0,
        passedHidden: 0,
        passedTests: 0,
        runtime: 0,
        memory: 0,
        message: 'System Error: Unable to execute tests'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run custom test case
  const runCustomTest = async () => {
    if (!customInput.trim()) return;
    
    setIsRunning(true);
    setCustomOutput('');
    setActiveTab('result');
    
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
      
      if (result.error) {
        setCustomOutput(`Error: ${result.error}`);
      } else if (result.stderr && result.stderr.trim()) {
        setCustomOutput(`Runtime Error: ${result.stderr}`);
      } else if (result.compile_output && result.compile_output.trim()) {
        setCustomOutput(`Compilation Error: ${result.compile_output}`);
      } else {
        setCustomOutput(result.stdout || 'No output');
      }
    } catch (error) {
      setCustomOutput(`System Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Phase 4: Code the Solution</CardTitle>
            {submissionResult && (
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(submissionResult.status)}>
                  {submissionResult.status === 'accepted' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {submissionResult.status !== 'accepted' && <XCircle className="h-3 w-3 mr-1" />}
                  {submissionResult.message}
                </Badge>
                {submissionResult.acceptanceDetails && (
                  <div className="text-xs text-gray-600">
                    Public: {submissionResult.passedPublic}/{submissionResult.publicTests} | 
                    Hidden: {submissionResult.passedHidden}/{submissionResult.hiddenTests}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Test case summary */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{getPublicTestCases().length} Public Test Cases</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>{getHiddenTestCases().length} Hidden Test Cases</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="test">Custom Test</TabsTrigger>
              <TabsTrigger value="result">
                Results
                {submissionResult && ` (${submissionResult.passedTests}/${submissionResult.totalTests})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-4">
              <div className="h-[500px] border rounded-lg overflow-hidden">
                <Editor
                  height="100%"
                  language={LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG].monaco}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{ 
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    tabSize: 2,
                    insertSpaces: true
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Test Case</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Input:</label>
                    <Textarea
                      placeholder="Enter your test input..."
                      className="font-mono text-sm"
                      rows={4}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={runCustomTest} 
                    disabled={!customInput.trim() || isRunning}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run Custom Test'}
                  </Button>
                  
                  {customOutput && (
                    <div>
                      <label className="text-sm font-medium block mb-2">Output:</label>
                      <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm whitespace-pre-wrap">
                        {customOutput}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="result" className="space-y-4">
              {/* Enhanced Submission Summary */}
              {submissionResult && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className={`text-2xl font-bold ${
                        submissionResult.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {submissionResult.message}
                      </div>
                      {submissionResult.status !== 'accepted' && (
                        <div className="text-sm text-gray-600 mt-1">
                          {submissionResult.failedTestType === 'public' 
                            ? `Failed on public test case ${submissionResult.failedTestIndex}`
                            : 'Failed on hidden test case'
                          }
                        </div>
                      )}
                    </div>
                    {/* Detailed Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">{submissionResult.passedPublic}</div>
                        <div className="text-xs text-gray-600">Public Passed</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{submissionResult.publicTests}</div>
                        <div className="text-xs text-gray-600">Public Total</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{submissionResult.passedHidden}</div>
                        <div className="text-xs text-gray-600">Hidden Passed</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">{submissionResult.hiddenTests}</div>
                        <div className="text-xs text-gray-600">Hidden Total</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{submissionResult.runtime.toFixed(3)}s</div>
                        <div className="text-xs text-gray-600">Runtime</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">{(submissionResult.memory / 1024).toFixed(1)}KB</div>
                        <div className="text-xs text-gray-600">Memory</div>
                      </div>
                    </div>
                    {/* Progress bars for test completion */}
                    <div className="mt-4 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Public Tests</span>
                          <span>{submissionResult.passedPublic}/{submissionResult.publicTests}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(submissionResult.passedPublic / submissionResult.publicTests) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Hidden Tests</span>
                          <span>{submissionResult.passedHidden}/{submissionResult.hiddenTests}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(submissionResult.passedHidden / submissionResult.hiddenTests) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* --- AI COMPLEXITY ANALYSIS CARD --- */}
              {complexityAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      AI Complexity Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold">Time Complexity: <Badge variant="secondary">{complexityAnalysis.timeComplexity}</Badge></h4>
                      <p className="text-gray-600 mt-1">{complexityAnalysis.timeExplanation}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold">Space Complexity: <Badge variant="secondary">{complexityAnalysis.spaceComplexity}</Badge></h4>
                      <p className="text-gray-600 mt-1">{complexityAnalysis.spaceExplanation}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold">Optimization Hint:</h4>
                      <p className="text-gray-600 mt-1">{complexityAnalysis.optimizationHint}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Test Results Display */}
              {testResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Test Results</h3>
                  {testResults.map((testResult, index) => (
                    <Card key={index} className={`border-l-4 ${
                      testResult.isCorrect 
                        ? 'border-l-green-500 bg-green-50' 
                        : 'border-l-red-500 bg-red-50'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(testResult.result.status.description, testResult.isCorrect)}
                            <span className="font-medium">
                              {testResult.isHidden ? `Hidden Test Case ${testResult.index}` : `Test Case ${testResult.index}`}
                            </span>
                            {testResult.isHidden && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {testResult.executionTime.toFixed(3)}s
                            </span>
                            <span className="flex items-center gap-1">
                              <MemoryStick className="h-3 w-3" />
                              {(testResult.memoryUsed / 1024).toFixed(1)}KB
                            </span>
                          </div>
                        </div>

                        {!testResult.isHidden && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="font-medium text-gray-700">Input:</label>
                              <div className="mt-1 p-2 bg-gray-100 rounded font-mono text-xs whitespace-pre-wrap">
                                {testResult.testCase.input || 'No input'}
                              </div>
                            </div>
                            <div>
                              <label className="font-medium text-gray-700">Expected Output:</label>
                              <div className="mt-1 p-2 bg-gray-100 rounded font-mono text-xs whitespace-pre-wrap">
                                {testResult.testCase.output}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-3">
                          <label className="font-medium text-gray-700">Your Output:</label>
                          <div className={`mt-1 p-2 rounded font-mono text-xs whitespace-pre-wrap ${
                            testResult.isCorrect ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {testResult.result.stdout || 'No output'}
                          </div>
                        </div>

                        {testResult.error && (
                          <div className="mt-3">
                            <label className="font-medium text-red-700">Error:</label>
                            <div className="mt-1 p-2 bg-red-100 rounded font-mono text-xs whitespace-pre-wrap">
                              {testResult.error}
                            </div>
                          </div>
                        )}

                        {testResult.result.stderr && (
                          <div className="mt-3">
                            <label className="font-medium text-red-700">Runtime Error:</label>
                            <div className="mt-1 p-2 bg-red-100 rounded font-mono text-xs whitespace-pre-wrap">
                              {testResult.result.stderr}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Custom Test Results */}
              {customOutput && activeTab === 'result' && testResults.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Custom Test Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm whitespace-pre-wrap">
                      {customOutput}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Action Buttons */}
          <Separator className="my-4" />
          <div className="flex gap-3">
            <Button 
              onClick={runCode} 
              disabled={isRunning || isSubmitting || !code.trim()} 
              variant="outline"
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
            
            <Button 
              onClick={submitSolution} 
              disabled={isSubmitting || isRunning || !code.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
            
            <Button 
              onClick={resetCode} 
              variant="outline" 
              size="icon"
              title="Reset to template"
              disabled={isRunning || isSubmitting}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Enhanced Help text */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
            <div className="font-medium mb-2">How Testing Works:</div>
            <div><strong>Run:</strong> Test your code against the {getPublicTestCases().length} public test cases shown in the problem description</div>
            <div><strong>Submit:</strong> Full evaluation against {getAllTestCases().length} total test cases ({getPublicTestCases().length} public + {getHiddenTestCases().length} hidden)</div>
            <div><strong>Hidden Tests:</strong> Cover edge cases, performance limits, and boundary conditions not visible during development</div>
            <div className="text-amber-600"><strong>Note:</strong> You must pass ALL test cases (both public and hidden) to get accepted</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}