// app/api/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';

const languageMap: { [key: string]: number } = {
  javascript: 93,
  python: 71,
  java: 62,
  cpp: 54,
  typescript: 94,
};

interface TestCase {
  input: string;
  output: string;
}

// Extract function name from code
function extractFunctionName(code: string, language: string): string {
  let match;
  
  switch (language) {
    case 'python':
      match = code.match(/def\s+(\w+)\s*\(/);
      break;
    case 'javascript':
    case 'typescript':
      match = code.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=|let\s+(\w+)\s*=|var\s+(\w+)\s*=)/);
      break;
    case 'java':
      match = code.match(/public\s+(?:static\s+)?\w+\s+(\w+)\s*\(/);
      break;
    case 'cpp':
      match = code.match(/(?:int|string|vector|bool|double|float|char|long)\s+(\w+)\s*\(/);
      break;
  }
  
  return match ? (match[1] || match[2] || match[3] || match[4]) : 'solution';
}

// Parse input based on common LeetCode patterns
function parseInput(input: string, language: string): any {
  const lines = input.trim().split('\n');
  
  try {
    // Try to parse as JSON first (most flexible)
    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        // If not JSON, try to parse as simple values
        const trimmed = line.trim();
        
        // Handle arrays like [1,2,3]
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          return JSON.parse(trimmed);
        }
        
        // Handle numbers
        if (!isNaN(Number(trimmed))) {
          return Number(trimmed);
        }
        
        // Handle strings (remove quotes if present)
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return trimmed.slice(1, -1);
        }
        
        return trimmed;
      }
    });
  } catch {
    return lines;
  }
}

// Create language-specific driver code
function createDriverScript(language: string, userCode: string, input: string, functionName?: string): string {
  const parsedInputs = parseInput(input, language);
  const detectedFunctionName = functionName || extractFunctionName(userCode, language);
  
  switch (language) {
    case 'python':
      return `
import sys
import json
from typing import *

${userCode}

def run_test():
    try:
        inputs = ${JSON.stringify(parsedInputs)}
        
        # Call the function with parsed inputs
        if len(inputs) == 1:
            result = ${detectedFunctionName}(inputs[0])
        elif len(inputs) == 2:
            result = ${detectedFunctionName}(inputs[0], inputs[1])
        elif len(inputs) == 3:
            result = ${detectedFunctionName}(inputs[0], inputs[1], inputs[2])
        else:
            result = ${detectedFunctionName}(*inputs)
        
        print(json.dumps(result, default=str))
    except Exception as e:
        print(f"Runtime Error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    run_test()
`;

    case 'javascript':
      return `
${userCode}

function runTest() {
    try {
        const inputs = ${JSON.stringify(parsedInputs)};
        
        let result;
        if (inputs.length === 1) {
            result = ${detectedFunctionName}(inputs[0]);
        } else if (inputs.length === 2) {
            result = ${detectedFunctionName}(inputs[0], inputs[1]);
        } else if (inputs.length === 3) {
            result = ${detectedFunctionName}(inputs[0], inputs[1], inputs[2]);
        } else {
            result = ${detectedFunctionName}(...inputs);
        }
        
        console.log(JSON.stringify(result));
    } catch (error) {
        console.log("Runtime Error: " + error.message);
        process.exit(1);
    }
}

runTest();
`;

    case 'typescript':
      return `
${userCode}

function runTest(): void {
    try {
        const inputs: any[] = ${JSON.stringify(parsedInputs)};
        
        let result: any;
        if (inputs.length === 1) {
            result = ${detectedFunctionName}(inputs[0]);
        } else if (inputs.length === 2) {
            result = ${detectedFunctionName}(inputs[0], inputs[1]);
        } else if (inputs.length === 3) {
            result = ${detectedFunctionName}(inputs[0], inputs[1], inputs[2]);
        } else {
            result = ${detectedFunctionName}(...inputs);
        }
        
        console.log(JSON.stringify(result));
    } catch (error) {
        console.log("Runtime Error: " + (error as Error).message);
        process.exit(1);
    }
}

runTest();
`;

    case 'java':
      return `
import java.util.*;
import java.util.stream.*;

public class Solution {
    ${userCode}
    
    public static void main(String[] args) {
        try {
            // Parse inputs
            String[] inputLines = {${parsedInputs.map(input => `"${JSON.stringify(input).replace(/"/g, '\\"')}"`).join(', ')}};
            
            Solution solution = new Solution();
            Object result = null;
            
            if (inputLines.length == 1) {
                // Try to parse as different types
                String input1 = inputLines[0];
                if (input1.startsWith("[") && input1.endsWith("]")) {
                    // Parse as array
                    String[] parts = input1.substring(1, input1.length()-1).split(",");
                    int[] arr = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();
                    result = solution.${detectedFunctionName}(arr);
                } else {
                    result = solution.${detectedFunctionName}(Integer.parseInt(input1));
                }
            } else if (inputLines.length == 2) {
                String input1 = inputLines[0];
                String input2 = inputLines[1];
                
                if (input1.startsWith("[") && input1.endsWith("]")) {
                    String[] parts = input1.substring(1, input1.length()-1).split(",");
                    int[] arr = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();
                    result = solution.${detectedFunctionName}(arr, Integer.parseInt(input2));
                }
            }
            
            // Format output
            if (result instanceof int[]) {
                System.out.println(Arrays.toString((int[])result));
            } else {
                System.out.println(result);
            }
            
        } catch (Exception e) {
            System.out.println("Runtime Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
`;

    case 'cpp':
      return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <climits>
using namespace std;

${userCode}

// Helper function to parse vector from string
vector<int> parseIntVector(string s) {
    vector<int> result;
    if (s.length() <= 2) return result;
    
    s = s.substr(1, s.length() - 2); // Remove [ ]
    stringstream ss(s);
    string item;
    
    while (getline(ss, item, ',')) {
        if (!item.empty()) {
            result.push_back(stoi(item));
        }
    }
    return result;
}

int main() {
    try {
        string inputs[] = {${parsedInputs.map(input => `"${JSON.stringify(input).replace(/"/g, '\\"')}"`).join(', ')}};
        
        // Call function based on input count
        vector<int> result;
        if (sizeof(inputs)/sizeof(inputs[0]) == 1) {
            result = ${detectedFunctionName}(parseIntVector(inputs[0]));
        } else {
            result = ${detectedFunctionName}(parseIntVector(inputs[0]), stoi(inputs[1]));
        }
        
        // Output result
        cout << "[";
        for (int i = 0; i < result.size(); i++) {
            if (i > 0) cout << ",";
            cout << result[i];
        }
        cout << "]" << endl;
        
    } catch (const exception& e) {
        cout << "Runtime Error: " << e.what() << endl;
        return 1;
    }
    
    return 0;
}
`;

    default:
      return userCode;
  }
}

// Format output to match expected format
function formatOutput(stdout: string, stderr: string, language: string): string {
  if (stderr && stderr.trim()) {
    return stderr.trim();
  }
  
  if (!stdout || !stdout.trim()) {
    return '';
  }
  
  try {
    // Try to parse and reformat JSON output
    const parsed = JSON.parse(stdout.trim());
    return JSON.stringify(parsed);
  } catch {
    // Return as-is if not valid JSON
    return stdout.trim();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { language, code, stdin, functionName } = await req.json();

    // Validate inputs
    if (!language || !code) {
      return NextResponse.json({ error: "Language and code are required" }, { status: 400 });
    }

    const languageId = languageMap[language];
    if (!languageId) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    // Create the full source code with the driver
    const fullSourceCode = createDriverScript(language, code, stdin || '', functionName);
    
    console.log('Generated source code:', fullSourceCode); // Debug log

    // Check if RapidAPI key exists
    if (!process.env.RAPIDAPI_KEY) {
      return NextResponse.json({
        error: "RapidAPI key not configured",
        status: { id: 6, description: "Configuration Error" }
      }, { status: 500 });
    }

    // Submit to Judge0
    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: fullSourceCode,
        stdin: '', // We embed input in the driver code
        cpu_time_limit: 2, // 2 seconds
        memory_limit: 128000, // 128MB
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Judge0 API error: ${response.status}`, errorText);
      return NextResponse.json({ 
        error: `Judge0 API error: ${errorText}`,
        status: { id: 6, description: "Compilation Error" }
      }, { status: 500 });
    }

    const result = await response.json();
    
    // Format the response to be more LeetCode-like
    const formattedResult = {
      ...result,
      stdout: formatOutput(result.stdout, result.stderr, language),
      // Add execution stats
      execution_time: result.time,
      memory_usage: result.memory,
      // Normalize status messages
      status: {
        ...result.status,
        description: result.status.description === "Accepted" ? "Accepted" :
                    result.status.description.includes("Error") ? "Runtime Error" :
                    result.status.description.includes("Limit") ? "Time Limit Exceeded" :
                    result.status.description
      }
    };

    return NextResponse.json(formattedResult);

  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json({
      error: "Internal server error during code execution",
      status: { id: 6, description: "System Error" },
      stdout: "",
      stderr: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}