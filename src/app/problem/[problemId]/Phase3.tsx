import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Phase3Props {
  algorithmText: string;
  setAlgorithmText: (val: string) => void;
  isLoading: boolean;
  feedback: string;
  handleSubmit: (e: React.FormEvent) => void;
}

const Phase3: React.FC<Phase3Props> = ({ algorithmText, setAlgorithmText, isLoading, feedback, handleSubmit }) => (
  <Card>
    <CardHeader><CardTitle>Phase 3: Design the Algorithm</CardTitle></CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea 
          placeholder="1. Initialize a hash map..." 
          className="min-h-[250px]" 
          value={algorithmText} 
          onChange={e => setAlgorithmText(e.target.value)} 
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Evaluating...' : 'Submit Algorithm'}
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

export default Phase3;
