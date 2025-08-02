import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  handleSubmit,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (feedback) {
      setDialogOpen(true);
    }
  }, [feedback]);

  return (
    <>
      <Card className="rounded-2xl shadow-md border-muted">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            🧪 Phase 2: Create Custom Test Cases
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Render added test cases */}
          <div className="space-y-2">
            {testCases.map((tc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-secondary rounded-xl"
              >
                <div className="text-sm font-mono text-muted-foreground">
                  <span className="font-semibold">Input:</span> {tc.input}{" "}
                  <span className="mx-1 text-muted">|</span>
                  <span className="font-semibold">Output:</span> {tc.output}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTestCase(i)}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Input fields */}
          <div className="flex gap-2">
            <Input
              placeholder="Input"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              className="rounded-xl"
            />
            <Input
              placeholder="Expected Output"
              value={currentOutput}
              onChange={(e) => setCurrentOutput(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Add Test Case button */}
          <Button
            onClick={handleAddTestCase}
            variant="outline"
            className="w-full rounded-xl"
          >
            ➕ Add Test Case
          </Button>

          <Separator className="my-4" />

          {/* Submit Test Cases */}
          <Button
            onClick={handleSubmit}
            disabled={testCases.length === 0 || isLoading}
            className="w-full rounded-xl"
          >
            {isLoading ? "Evaluating..." : "Submit Test Cases"}
          </Button>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              🧠 AI Feedback
            </DialogTitle>
            <DialogDescription className="pt-2 text-muted-foreground">
              {feedback}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Phase2;
