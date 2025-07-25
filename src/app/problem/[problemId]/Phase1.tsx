import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Phase1Props {
  understanding: string;
  setUnderstanding: (val: string) => void;
  isLoading: boolean;
  feedback: string;
  handleSubmit: (e: React.FormEvent) => void;
}

const Phase1: React.FC<Phase1Props> = ({ understanding, setUnderstanding, isLoading, feedback, handleSubmit }) => (
  <Card>
    <CardHeader><CardTitle>Phase 1: Understand the Problem</CardTitle></CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea 
          placeholder="Explain the inputs, outputs, and constraints..." 
          className="min-h-[200px]" 
          value={understanding} 
          onChange={e => setUnderstanding(e.target.value)} 
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Evaluating...' : 'Submit Explanation'}
        </Button>
      </form>
      {feedback && (
        <Alert className="mt-4">
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
);

export default Phase1;
