import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

interface TestCase {
  input: string;
  output: string;
}

interface Phase2Props {
  testCases: TestCase[];
  currentInput: string;
  setCurrentInput: (val: string) => void;
  currentOutput: string;
  setCurrentOutput: (val: string) => void;
  handleAddTestCase: () => void;
  handleRemoveTestCase: (index: number) => void;
  isLoading: boolean;
  feedback: string | null;
  handleSubmit: () => void;
}

const Phase2: React.FC<Phase2Props> = ({
  testCases,
  currentInput,
  setCurrentInput,
  currentOutput,
  setCurrentOutput,
  handleAddTestCase,
  handleRemoveTestCase,
  isLoading,
  feedback,
  handleSubmit
}) => (
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
        onClick={handleSubmit} 
        className="w-full" 
        disabled={testCases.length === 0 || isLoading}
      >
        {isLoading ? 'Evaluating...' : 'Submit Test Cases'}
      </Button>
      {feedback && (
        <Alert className="mt-4">
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
);

export default Phase2;
