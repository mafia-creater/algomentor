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

interface Phase3Props {
  algorithmText: string;
  setAlgorithmText: (val: string) => void;
  isLoading: boolean;
  feedback: string;
  handleSubmit: (e: React.FormEvent) => void;
}

const Phase3: React.FC<Phase3Props> = ({
  algorithmText,
  setAlgorithmText,
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
            📐 Phase 3: Design the Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Textarea
              placeholder={`1. Initialize a hash map\n2. Loop through array...\n3. Return result`}
              className="min-h-[250px] rounded-xl p-4 text-base font-mono"
              value={algorithmText}
              onChange={(e) => setAlgorithmText(e.target.value)}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl text-base"
            >
              {isLoading ? "Evaluating..." : "Submit Algorithm"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feedback Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              💬 AI Feedback
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

export default Phase3;
