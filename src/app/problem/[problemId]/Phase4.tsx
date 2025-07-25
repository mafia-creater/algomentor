import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Editor from "@monaco-editor/react";
import { Play, Zap, RotateCcw } from "lucide-react";

interface TestCase {
  input: string;
  output: string;
}

interface TestResult {
  testCase: TestCase;
  result: any;
  isCorrect: boolean;
  index?: number;
}

interface Phase4Props {
  language: string;
  setLanguage: (val: string) => void;
  code: string;
  setCode: (val: string) => void;
  activeTab: string;
  setActiveTab: (val: string) => void;
  customInput: string;
  setCustomInput: (val: string) => void;
  runCode: () => void;
  runCustomTest: () => void;
  submitSolution: () => void;
  resetCode: () => void;
  isRunning: boolean;
  isExecuting: boolean;
  testResults: TestResult[];
}

const LANGUAGE_CONFIG = {
  python: { name: 'Python 3', monaco: 'python' },
  javascript: { name: 'JavaScript', monaco: 'javascript' },
  java: { name: 'Java', monaco: 'java' },
  cpp: { name: 'C++', monaco: 'cpp' },
  typescript: { name: 'TypeScript', monaco: 'typescript' }
};

const Phase4: React.FC<Phase4Props> = ({
  language,
  setLanguage,
  code,
  setCode,
  activeTab,
  setActiveTab,
  customInput,
  setCustomInput,
  runCode,
  runCustomTest,
  submitSolution,
  resetCode,
  isRunning,
  isExecuting,
  testResults
}) => (
  <Card className="flex-1 flex flex-col">
    <CardHeader>
      <CardTitle>Phase 4: Code the Solution</CardTitle>
    </CardHeader>
    <CardContent className="flex-1 flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
          <TabsTrigger value="result">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="code" className="flex-1 mt-0">
          <div className="h-[60vh] border rounded-lg overflow-hidden">
            <Editor
              height="100%"
              language={LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG].monaco}
              theme="vs-dark"
              value={code}
              onChange={value => setCode(value || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', roundedSelection: false, scrollBeyondLastLine: false, automaticLayout: true }}
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
                    onChange={e => setCustomInput(e.target.value)}
                  />
                </div>
                <Button onClick={runCustomTest} disabled={!customInput.trim() || isRunning} className="w-full">
                  Run Custom Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="result" className="flex-1 mt-0">
          {/* Results UI Here */}
          {testResults.map((r, i) => <div key={i}>{`Test ${i+1}: ${r.isCorrect ? 'Pass' : 'Fail'}`}</div>)}
        </TabsContent>
      </Tabs>
      <div className="flex gap-2 mt-4">
        <Button onClick={runCode} disabled={isRunning} variant="outline">
          <Play className="h-4 w-4 mr-2" />
          {isRunning ? 'Running...' : 'Run All Tests'}
        </Button>
        <Button onClick={submitSolution} disabled={isExecuting || !code.trim()}>
          <Zap className="h-4 w-4 mr-2" />
          {isExecuting ? 'Submitting...' : 'Submit Solution'}
        </Button>
        <Button onClick={resetCode} variant="outline" size="icon">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default Phase4;
