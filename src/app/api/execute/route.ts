// app/api/execute/route.ts - Fixed version with better error handling and UTF-8 support
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

// Extract function name from code with better regex patterns
function extractFunctionName(code: string, language: string): string {
  let match;
  
  switch (language) {
    case 'python':
      match = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      break;
    case 'javascript':
    case 'typescript':
      match = code.match(/(?:function\s+([a-zA-Z_][a-zA-Z0-9_]*)|(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=)/);
      break;
    case 'java':
      match = code.match(/public\s+(?:static\s+)?(?:\w+(?:\[\])?|\w+<[^>]*>)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/);
      break;
    case 'cpp':
      match = code.match(/(?:vector<int>|int|string|vector|bool|double|float|char|long|auto)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      break;
  }
  
  return match ? (match[1] || match[2]) : 'solution';
}

// Better input parsing with proper format handling
function parseInput(input: string): any[] {
  if (!input.trim()) return [];

  // Split by lines and clean up
  const lines = input.trim().split('\n').map(line => line.trim()).filter(line => line);
  
  return lines.map(line => {
    try {
      // Handle array format: [1,2,3] or [1, 2, 3]
      if (line.startsWith('[') && line.endsWith(']')) {
        // Clean up the array string
        const arrayContent = line.slice(1, -1).trim();
        if (!arrayContent) return [];
        
        // Split by comma and parse each element
        const elements = arrayContent.split(',').map(item => {
          const trimmed = item.trim();
          // Try to parse as number
          if (!isNaN(Number(trimmed)) && trimmed !== '') {
            return Number(trimmed);
          }
          // Remove quotes if present and return as string
          return trimmed.replace(/^["']|["']$/g, '');
        });
        
        return elements;
      }
      
      // Handle boolean values
      if (line.toLowerCase() === 'true') return true;
      if (line.toLowerCase() === 'false') return false;
      if (line.toLowerCase() === 'null') return null;
      
      // Try to parse as number
      if (!isNaN(Number(line)) && line !== '') {
        return Number(line);
      }
      
      // Try JSON parse as fallback
      try {
        return JSON.parse(line);
      } catch {
        // Return as string, removing quotes if present
        return line.replace(/^["']|["']$/g, '');
      }
    } catch (error) {
      console.error('Error parsing input line:', line, error);
      return line;
    }
  });
}

// Create language-specific driver code with better error handling
function createDriverScript(language: string, userCode: string, input: string, functionName?: string): string {
  const parsedInputs = parseInput(input);
  const detectedFunctionName = extractFunctionName(userCode, language) || functionName;
  
  console.log('Parsed inputs:', parsedInputs, 'Function name:', detectedFunctionName);
  
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
        
        # Handle different input counts
        if len(inputs) == 0:
            result = ${detectedFunctionName}()
        elif len(inputs) == 1:
            result = ${detectedFunctionName}(inputs[0])
        elif len(inputs) == 2:
            result = ${detectedFunctionName}(inputs[0], inputs[1])
        elif len(inputs) == 3:
            result = ${detectedFunctionName}(inputs[0], inputs[1], inputs[2])
        elif len(inputs) == 4:
            result = ${detectedFunctionName}(inputs[0], inputs[1], inputs[2], inputs[3])
        else:
            result = ${detectedFunctionName}(*inputs)
        
        # Format output consistently
        if result is None:
            print("null")
        elif isinstance(result, bool):
            print("true" if result else "false")
        elif isinstance(result, (list, tuple)):
            print(json.dumps(list(result)))
        elif isinstance(result, dict):
            print(json.dumps(result))
        else:
            print(json.dumps(result))
            
    except Exception as e:
        import traceback
        print(f"Runtime Error: {str(e)}", file=sys.stderr)
        print(f"Traceback: {traceback.format_exc()}", file=sys.stderr)
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
        if (inputs.length === 0) {
            result = ${detectedFunctionName}();
        } else if (inputs.length === 1) {
            result = ${detectedFunctionName}(inputs[0]);
        } else if (inputs.length === 2) {
            result = ${detectedFunctionName}(inputs[0], inputs[1]);
        } else if (inputs.length === 3) {
            result = ${detectedFunctionName}(inputs[0], inputs[1], inputs[2]);
        } else if (inputs.length === 4) {
            result = ${detectedFunctionName}(inputs[0], inputs[1], inputs[2], inputs[3]);
        } else {
            result = ${detectedFunctionName}(...inputs);
        }
        
        // Format output consistently
        if (result === null) {
            console.log("null");
        } else if (typeof result === 'boolean') {
            console.log(result ? "true" : "false");
        } else {
            console.log(JSON.stringify(result));
        }
        
    } catch (error) {
        console.error("Runtime Error: " + error.message);
        console.error("Stack: " + error.stack);
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
        if (inputs.length === 0) {
            result = ${detectedFunctionName}();
        } else if (inputs.length === 1) {
            result = ${detectedFunctionName}(inputs[0]);
        } else if (inputs.length === 2) {
            result = ${detectedFunctionName}(inputs[0], inputs[1]);
        } else if (inputs.length === 3) {
            result = ${detectedFunctionName}(inputs[0], inputs[1], inputs[2]);
        } else if (inputs.length === 4) {
            result = ${detectedFunctionName}(inputs[0], inputs[1], inputs[2], inputs[3]);
        } else {
            result = ${detectedFunctionName}(...inputs);
        }
        
        // Format output consistently
        if (result === null) {
            console.log("null");
        } else if (typeof result === 'boolean') {
            console.log(result ? "true" : "false");
        } else {
            console.log(JSON.stringify(result));
        }
        
    } catch (error) {
        console.error("Runtime Error: " + (error as Error).message);
        console.error("Stack: " + (error as Error).stack);
        process.exit(1);
    }
}

runTest();
`;

    case 'java':
      const javaInputsJson = JSON.stringify(parsedInputs);
      return `
import java.util.*;
import java.util.stream.*;

public class Solution {
    ${userCode}
    
    public static void main(String[] args) {
        try {
            // Parse inputs from JSON
            String inputsJson = """${javaInputsJson.replace(/"/g, '\\"')}""";
            
            Solution solution = new Solution();
            Object result = null;
            
            // Simple input parsing based on the JSON structure
            if (inputsJson.equals("[]")) {
                result = solution.${detectedFunctionName}();
            } else {
                // For now, handle common patterns manually
                ${generateJavaInputHandling(parsedInputs, detectedFunctionName)}
            }
            
            // Format output
            if (result instanceof int[]) {
                int[] arr = (int[]) result;
                System.out.print("[");
                for (int i = 0; i < arr.length; i++) {
                    if (i > 0) System.out.print(",");
                    System.out.print(arr[i]);
                }
                System.out.println("]");
            } else if (result instanceof boolean[]) {
                boolean[] arr = (boolean[]) result;
                System.out.print("[");
                for (int i = 0; i < arr.length; i++) {
                    if (i > 0) System.out.print(",");
                    System.out.print(arr[i] ? "true" : "false");
                }
                System.out.println("]");
            } else if (result instanceof Boolean) {
                System.out.println((Boolean) result ? "true" : "false");
            } else if (result instanceof List) {
                List<?> list = (List<?>) result;
                System.out.print("[");
                for (int i = 0; i < list.size(); i++) {
                    if (i > 0) System.out.print(",");
                    System.out.print(list.get(i));
                }
                System.out.println("]");
            } else {
                System.out.println(result);
            }
            
        } catch (Exception e) {
            System.err.println("Runtime Error: " + e.getMessage());
            e.printStackTrace();
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
using namespace std;

${userCode}

void printVector(const vector<int>& vec) {
    cout << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        if (i > 0) cout << ",";
        cout << vec[i];
    }
    cout << "]";
}

int main() {
    try {
        ${generateCppInputHandling(parsedInputs, detectedFunctionName)}
        
    } catch (const exception& e) {
        cerr << "Runtime Error: " << e.what() << endl;
        return 1;
    }
    
    return 0;
}
`;

    default:
      return userCode;
  }
}

// Helper function to generate Java input handling
function generateJavaInputHandling(inputs: any[], functionName: string): string {
  if (inputs.length === 0) {
    return `result = solution.${functionName}();`;
  } else if (inputs.length === 1) {
    const input = inputs[0];
    if (Array.isArray(input)) {
      const arrayStr = input.map(String).join(',');
      return `
        int[] arr1 = {${arrayStr}};
        result = solution.${functionName}(arr1);
      `;
    } else {
      return `result = solution.${functionName}(${JSON.stringify(input)});`;
    }
  } else if (inputs.length === 2) {
    const input1 = inputs[0];
    const input2 = inputs[1];
    
    if (Array.isArray(input1)) {
      const arrayStr = input1.map(String).join(',');
      return `
        int[] arr1 = {${arrayStr}};
        ${typeof input2 === 'number' ? `int target = ${input2};` : `String str2 = "${input2}";`}
        result = solution.${functionName}(arr1, ${typeof input2 === 'number' ? 'target' : 'str2'});
      `;
    } else {
      return `result = solution.${functionName}(${JSON.stringify(input1)}, ${JSON.stringify(input2)});`;
    }
  }
  
  return `// Complex input handling not implemented`;
}

// Helper function to generate C++ input handling
function generateCppInputHandling(inputs: any[], functionName: string): string {
  if (inputs.length === 0) {
    return `
        auto result = ${functionName}();
        cout << result << endl;
    `;
  } else if (inputs.length === 1) {
    const input = inputs[0];
    if (Array.isArray(input)) {
      const arrayStr = input.map(String).join(',');
      return `
        vector<int> vec1 = {${arrayStr}};
        auto result = ${functionName}(vec1);
        if (typeid(result) == typeid(vector<int>)) {
            printVector(result);
            cout << endl;
        } else {
            cout << result << endl;
        }
      `;
    } else {
      return `
        auto result = ${functionName}(${JSON.stringify(input)});
        cout << result << endl;
      `;
    }
  } else if (inputs.length === 2) {
    const input1 = inputs[0];
    const input2 = inputs[1];
    
    if (Array.isArray(input1)) {
      const arrayStr = input1.map(String).join(',');
      return `
        vector<int> vec1 = {${arrayStr}};
        ${typeof input2 === 'number' ? `int target = ${input2};` : `string str2 = "${input2}";`}
        auto result = ${functionName}(vec1, ${typeof input2 === 'number' ? 'target' : 'str2'});
        if (typeid(result) == typeid(vector<int>)) {
            printVector(result);
            cout << endl;
        } else {
            cout << result << endl;
        }
      `;
    } else {
      return `
        auto result = ${functionName}(${JSON.stringify(input1)}, ${JSON.stringify(input2)});
        cout << result << endl;
      `;
    }
  }
  
  return `// Complex input handling not implemented`;
}

// Format output to ensure consistency
function formatOutput(stdout: string, stderr: string, status: any): string {
  if (stderr && stderr.trim()) {
    return '';
  }
  
  if (status.id === 6) {
    return '';
  }
  
  if (!stdout || !stdout.trim()) {
    return '';
  }
  
  const output = stdout.trim();
  
  try {
    const parsed = JSON.parse(output);
    return JSON.stringify(parsed);
  } catch {
    if (output === 'true' || output === 'false' || output === 'null') {
      return output;
    }
    return output;
  }
}

// Helper function to normalize status descriptions
function getStatusDescription(statusId: number, originalDescription: string): string {
  switch (statusId) {
    case 1: return "In Queue";
    case 2: return "Processing";
    case 3: return "Accepted";
    case 4: return "Wrong Answer";
    case 5: return "Time Limit Exceeded";
    case 6: return "Compilation Error";
    case 7: return "Runtime Error (SIGSEGV)";
    case 8: return "Runtime Error (SIGXFSZ)";
    case 9: return "Runtime Error (SIGFPE)";
    case 10: return "Runtime Error (SIGABRT)";
    case 11: return "Runtime Error (NZEC)";
    case 12: return "Runtime Error (Other)";
    case 13: return "Internal Error";
    case 14: return "Exec Format Error";
    default: return originalDescription || "Unknown Error";
  }
}

// Convert string to base64 for UTF-8 safety
function toBase64(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    console.log('Execute API called');
    
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ 
        error: "Invalid JSON in request body",
        status: { id: 6, description: "Invalid Request" },
        stdout: "",
        stderr: "Invalid request format"
      }, { status: 400 });
    }

    const { language, code, stdin, functionName } = body;
    
    console.log('Request data:', { language, codeLength: code?.length, stdin, functionName });

    // Validate inputs
    if (!language || !code) {
      return NextResponse.json({ 
        error: "Language and code are required",
        status: { id: 6, description: "Invalid Request" },
        stdout: "",
        stderr: "Language and code are required"
      }, { status: 400 });
    }

    const languageId = languageMap[language];
    if (!languageId) {
      return NextResponse.json({ 
        error: `Unsupported language: ${language}`,
        status: { id: 6, description: "Unsupported Language" },
        stdout: "",
        stderr: `Language '${language}' is not supported`
      }, { status: 400 });
    }

    // Create the full source code with the driver
    const fullSourceCode = createDriverScript(language, code, stdin || '', functionName);
    
    console.log(`Generated ${language} source code (${fullSourceCode.length} chars)`);

    // Check if RapidAPI key exists
    if (!process.env.RAPIDAPI_KEY) {
      console.error('RAPIDAPI_KEY not found in environment');
      return NextResponse.json({
        error: "RapidAPI key not configured",
        status: { id: 6, description: "Configuration Error" },
        stdout: "",
        stderr: "Server configuration error - missing API key"
      }, { status: 500 });
    }

    // Prepare submission data with base64 encoding to handle UTF-8 issues
    const submissionData = {
      language_id: languageId,
      source_code: toBase64(fullSourceCode),
      stdin: '',
      cpu_time_limit: 5,
      memory_limit: 256000,
      wall_time_limit: 10,
    };

    // Submit to Judge0 with enhanced error handling
    let response;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`Attempt ${attempts + 1} to call Judge0 API`);
        
        response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
          body: JSON.stringify(submissionData),
        });
        
        console.log(`Judge0 API response status: ${response.status}`);
        
        if (response.ok) {
          break;
        } else {
          const errorText = await response.text();
          console.error(`Judge0 API error (attempt ${attempts + 1}):`, response.status, errorText);
          
          // If it's a client error (4xx), don't retry
          if (response.status >= 400 && response.status < 500) {
            return NextResponse.json({
              error: `Judge0 API client error: ${errorText}`,
              status: { id: 6, description: "API Client Error" },
              stdout: "",
              stderr: `API Error: ${errorText}`
            }, { status: response.status });
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Network error (attempt ${attempts + 1}):`, error);
        attempts++;
        if (attempts >= maxAttempts) {
          return NextResponse.json({
            error: "Network error communicating with Judge0 API",
            status: { id: 6, description: "Network Error" },
            stdout: "",
            stderr: "Unable to connect to code execution service"
          }, { status: 500 });
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'No response received';
      return NextResponse.json({ 
        error: `Judge0 API failed after ${maxAttempts} attempts: ${errorText}`,
        status: { id: 6, description: "API Error" },
        stdout: "",
        stderr: "Code execution service unavailable"
      }, { status: 500 });
    }

    let result;
    try {
      const responseText = await response.text();
      console.log('Judge0 response text length:', responseText.length);
      
      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Received HTML response instead of JSON:', responseText.substring(0, 200));
        return NextResponse.json({
          error: "Judge0 API returned HTML error page",
          status: { id: 6, description: "API Error" },
          stdout: "",
          stderr: "Code execution service returned invalid response"
        }, { status: 500 });
      }
      
      result = JSON.parse(responseText);
      console.log('Parsed Judge0 result:', { status: result.status, hasStdout: !!result.stdout, hasStderr: !!result.stderr });
      
      // Decode base64 encoded responses
      if (result.stdout) {
        result.stdout = Buffer.from(result.stdout, 'base64').toString('utf8');
      }
      if (result.stderr) {
        result.stderr = Buffer.from(result.stderr, 'base64').toString('utf8');
      }
      if (result.compile_output) {
        result.compile_output = Buffer.from(result.compile_output, 'base64').toString('utf8');
      }
      
    } catch (error) {
      console.error('Error parsing Judge0 response:', error);
      return NextResponse.json({
        error: "Invalid response from Judge0 API",
        status: { id: 6, description: "Parse Error" },
        stdout: "",
        stderr: "Unable to parse execution results"
      }, { status: 500 });
    }

    // Enhanced result formatting
    const formattedResult = {
      ...result,
      stdout: formatOutput(result.stdout, result.stderr, result.status),
      stderr: result.stderr || result.compile_output || '',
      execution_time: result.time,
      memory_usage: result.memory,
      status: {
        ...result.status,
        description: getStatusDescription(result.status.id, result.status.description)
      }
    };

    console.log('Returning formatted result:', { 
      statusId: formattedResult.status.id, 
      statusDesc: formattedResult.status.description,
      hasOutput: !!formattedResult.stdout,
      stderr: formattedResult.stderr?.substring(0, 100)
    });

    return NextResponse.json(formattedResult);

  } catch (error) {
    console.error("Unexpected error in execute API:", error);
    return NextResponse.json({
      error: "Internal server error during code execution",
      status: { id: 6, description: "System Error" },
      stdout: "",
      stderr: error instanceof Error ? error.message : "Unknown system error"
    }, { status: 500 });
  }
}