import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Phase1Props {
  understanding: string;
  setUnderstanding: (val: string) => void;
  isLoading: boolean;
  feedback: string;
  handleSubmit: (e: React.FormEvent) => void;
}

const Phase1: React.FC<Phase1Props> = ({
  understanding,
  setUnderstanding,
  isLoading,
  feedback,
  handleSubmit,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (feedback) {
      setOpen(true);
    }
  }, [feedback]);

  return (
    <>
      <Card className="border-muted shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            🧠 Phase 1: Understand the Problem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Describe the problem in your own words. Mention inputs, outputs, constraints..."
              className="min-h-[180px] rounded-xl p-4 text-base"
              value={understanding}
              onChange={(e) => setUnderstanding(e.target.value)}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl text-base"
            >
              {isLoading ? "Evaluating..." : "Submit Explanation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">💬 AI Feedback</DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2 leading-relaxed">
              {feedback}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Phase1;
