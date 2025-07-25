// Enhanced Phase 4 Component with LeetCode-like functionality
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
  EyeOff
} from 'lucide-react';
import Editor from '@monaco-editor/react';

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
  isHidden?: boolean;
};

type SubmissionResult = {
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded' | 'compilation_error' | 'system_error';
  totalTests: number;
  passedTests: number;
  failedTestIndex?: number;
  runtime: number;
  memory: number;
  testResults?: TestResult[];
  message?: string;
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
  testCases: TestCase[];
  markPhaseCompleted: (phase: number) => void;
  initialSubmission?: any;
}

export default function EnhancedPhase4({ 
  problem, 
  language, 
  setLanguage, 
  code, 
  setCode, 
  testCases, 
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

  // Get example test cases (visible ones) from problem description
  const getExampleTestCases = (): TestCase[] => {
    return (problem.defaultTestCases as TestCase[]) || [];
  };

  // Get all test cases for submission (examples + additional hidden tests)
  const getAllTestCases = (): TestCase[] => {
    const examples = getExampleTestCases();
    const additionalTests = testCases.filter(tc => !examples.some(ex => ex.input === tc.input && ex.output === tc.output));
    return [...examples, ...additionalTests];
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
              functionName: problem.functionName
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

  // Run code against example test cases only
  const runCode = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSubmissionResult(null);
    setActiveTab('result');
    
    const exampleTests = getExampleTestCases();
    if (exampleTests.length === 0) {
      setTestResults([]);
      setIsRunning(false);
      return;
    }
    
    try {
      const results = await executeTestCases(exampleTests, false);
      setTestResults(results);
      
    } catch (error) {
      console.error('Execution error:', error);
      setTestResults([{
        testCase: { input: '', output: '', explanation: '' },
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
        error: error instanceof Error ? error.message : 'System error occurred'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit solution (run against all test cases)
  const submitSolution = async () => {
    setIsSubmitting(true);
    setTestResults([]);
    setSubmissionResult(null);
    setActiveTab('result');
    
    const allTests = getAllTestCases();
    
    try {
      const results = await executeTestCases(allTests, true);
      
      // Calculate submission statistics
      const passedTests = results.filter(r => r.isCorrect).length;
      const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
      const maxMemory = Math.max(...results.map(r => r.memoryUsed));
      
      // Determine submission status
      let status: SubmissionResult['status'] = 'accepted';
      let failedTestIndex: number | undefined;
      let message: string | undefined;
      
      // Check for compilation errors first
      const hasCompilationError = results.some(r => 
        r.result.status.id === 6 || r.result.status.description.toLowerCase().includes('compilation')
      );
      
      if (hasCompilationError) {
        status = 'compilation_error';
        message = 'Compilation Error';
      } else {
        // Find first failed test
        const firstFailedTest = results.find(r => !r.isCorrect);
        
        if (firstFailedTest) {
          failedTestIndex = firstFailedTest.index;
          
          if (firstFailedTest.result.status.id === 5) {
            status = 'time_limit_exceeded';
            message = 'Time Limit Exceeded';
          } else if (firstFailedTest.result.status.id >= 7) {
            status = 'runtime_error';
            message = 'Runtime Error';
          } else if (firstFailedTest.result.status.id === 6) {
            status = 'compilation_error';
            message = 'Compilation Error';
          } else {
            status = 'wrong_answer';
            message = `Wrong Answer - Failed on test case ${failedTestIndex}`;
          }
        } else {
          // All tests passed
          status = 'accepted';
          message = 'Accepted';
          markPhaseCompleted(4);
        }
      }
      
      const submissionResult: SubmissionResult = {
        status,
        totalTests: allTests.length,
        passedTests,
        failedTestIndex,
        runtime: totalTime,
        memory: maxMemory,
        testResults: results,
        message
      };
      
      setSubmissionResult(submissionResult);
      
      // For display, show results up to first failure (or all if accepted)
      const displayResults = status === 'accepted' ? results : results.slice(0, (failedTestIndex || results.length));
      setTestResults(displayResults);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionResult({
        status: 'system_error',
        totalTests: allTests.length,
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
              <Badge className={getStatusColor(submissionResult.status)}>
                {submissionResult.status === 'accepted' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {submissionResult.status !== 'accepted' && <XCircle className="h-3 w-3 mr-1" />}
                {submissionResult.message}
              </Badge>
            )}
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
              {/* Submission Summary */}
              {submissionResult && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className={`text-2xl font-bold ${
                        submissionResult.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {submissionResult.message}
                      </div>
                      {submissionResult.status !== 'accepted' && submissionResult.failedTestIndex && (
                        <div className="text-sm text-gray-600 mt-1">
                          Failed on test case {submissionResult.failedTestIndex}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{submissionResult.passedTests}</div>
                        <div className="text-sm text-gray-600">Passed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{submissionResult.totalTests}</div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{submissionResult.runtime.toFixed(3)}s</div>
                        <div className="text-sm text-gray-600">Runtime</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{(submissionResult.memory / 1024).toFixed(1)}KB</div>
                        <div className="text-sm text-gray-600">Memory</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Test Results */}
              {testResults.length > 0 && (
                <>
                  {submissionResult && submissionResult.testResults && submissionResult.testResults.some(r => r.isHidden) && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Some test cases are hidden during submission
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHiddenTests(!showHiddenTests)}
                      >
                        {showHiddenTests ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showHiddenTests ? 'Hide' : 'Show'} Hidden Tests
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {testResults
                      .filter(result => !result.isHidden || showHiddenTests)
                      .map((testResult, index) => (
                      <Card key={index} className="border-l-4 border-l-transparent">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(testResult.result.status.description, testResult.isCorrect)}
                              <span className="font-medium">
                                Test Case {testResult.index}
                                {testResult.isHidden && <Badge variant="outline" className="ml-2 text-xs">Hidden</Badge>}
                              </span>
                              <Badge className={getStatusColor(testResult.result.status.description)} variant="outline">
                                {testResult.result.status.description}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {testResult.executionTime.toFixed(3)}s
                              </div>
                              <div className="flex items-center gap-1">
                                <MemoryStick className="h-3 w-3" />
                                {(testResult.memoryUsed / 1024).toFixed(1)}KB
                              </div>
                            </div>
                          </div>

                          {!testResult.isHidden && (
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Input:</span>
                                <div className="font-mono bg-gray-50 p-2 rounded mt-1">
                                  {testResult.testCase.input || 'No input'}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium">Expected:</span>
                                <div className="font-mono bg-gray-50 p-2 rounded mt-1">
                                  {testResult.testCase.output}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium">Your Output:</span>
                                <div className={`font-mono p-2 rounded mt-1 ${
                                  testResult.isCorrect ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                  {formatOutput(testResult.result.stdout) || 'No output'}
                                </div>
                              </div>

                              {testResult.error && (
                                <div>
                                  <span className="font-medium text-red-600">Error:</span>
                                  <div className="font-mono bg-red-50 p-2 rounded mt-1 text-red-700">
                                    {testResult.error}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {/* Empty state */}
              {testResults.length === 0 && !isRunning && !isSubmitting && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <div>Run your code to see test results</div>
                </div>
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
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
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

          {/* Help text */}
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <div><strong>Run:</strong> Test your code against the example test cases shown in the problem description</div>
            <div><strong>Submit:</strong> Submit your solution to be tested against all test cases (including hidden ones)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}