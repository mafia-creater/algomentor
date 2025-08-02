'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { ListChecks, FileText, Lightbulb } from 'lucide-react';

// Assuming TagList is in a separate file, otherwise define it here.
// For example:
const TagList = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map(tag => (
      <Badge key={tag} variant="outline">{tag}</Badge>
    ))}
  </div>
);


type TestCase = { input: string; output: string };

interface ProblemStatementProps {
  problem: {
    title: string;
    description: string;
    defaultTestCases: TestCase[];
    constraints: string[];
    tags: string[];
    hints: string[];
  };
}

function ProblemStatement({ problem }: ProblemStatementProps) {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-48 shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl">{problem.title}</CardTitle>
          <div className="pt-2">
            <TagList tags={problem.tags} />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">
                <FileText className="h-4 w-4 mr-2" />
                Description
              </TabsTrigger>
              <TabsTrigger value="constraints">
                <ListChecks className="h-4 w-4 mr-2" />
                Constraints
              </TabsTrigger>
              <TabsTrigger value="hints">
                <Lightbulb className="h-4 w-4 mr-2" />
                Hints
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {problem.description}
                </p>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-sm">Examples:</h4>
                {(problem.defaultTestCases || []).map((tc, index) => (
                  <div key={index} className="mb-4 p-3 bg-slate-50 rounded-lg border">
                    <p className="font-medium text-sm mb-2">Example {index + 1}:</p>
                    <div className="font-mono text-xs space-y-1">
                      <div><span className="font-semibold">Input:</span> {tc.input.replace(/\n/g, ', ')}</div>
                      <div><span className="font-semibold">Output:</span> {tc.output}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="constraints" className="mt-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {(problem.constraints || []).map((constraint, index) => (
                  <li key={index} className="font-mono">{constraint}</li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="hints" className="mt-4 space-y-3">
              {(problem.hints || []).map((hint, index) => (
                <Alert key={index} className="text-sm border-yellow-200 bg-yellow-50 text-yellow-800">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <strong>Hint {index + 1}:</strong> {hint}
                  </AlertDescription>
                </Alert>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProblemStatement;
