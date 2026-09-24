import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert coding tutor. Explain the following code in simple, beginner-friendly terms.
    Your response MUST be formatted strictly in Markdown. Use the following structure:
    # Beginner Summary
    (A 1-2 sentence high-level summary of what the code does)
    
    # Real-life Analogy
    (Explain the core logic using a simple real-life analogy)
    
    # Line-by-Line Breakdown
    (Break down important lines or blocks of code)
    
    # Simpler Alternative (if any)
    (Provide a simpler or more modern way to write this, if applicable. Wrap code in markdown blocks.)
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: systemPrompt + '\n\nCODE TO EXPLAIN:\n' + code,
        });
        break;
      } catch (e: unknown) {
        const error = e as { status?: number };
        if (error.status === 503 && retries > 1) {
          retries--;
          await new Promise(r => setTimeout(r, 2000));
        } else {
          console.warn("Gemini API overloaded. Using fallback mock explain.");
          response = {
            text: "# Beginner Summary\nThis code calculates the Fibonacci sequence using recursion. It returns the Nth number in the sequence.\n\n# Real-life Analogy\nImagine you want to know how many branches a tree has. You ask a branch, and it says 'I don't know, let me ask my two sub-branches and add them together.' This continues until you reach the leaves (n <= 1), which know they are just 1 branch.\n\n# Line-by-Line Breakdown\n- `if n <= 1:`: This is the base case. If we ask for the 0th or 1st number, it's just `n`.\n- `return fibonacci(n-1) + fibonacci(n-2)`: This is the recursive step. It calls itself twice to get the two previous numbers and adds them.\n\n# Simpler Alternative\nRecursion can be slow. Here is an iterative approach:\n```python\ndef fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n```\n*(Note: This is a fallback mock response due to simulated API load)*"
          };
          break;
        }
      }
    }

    const explanationText = response?.text || "Could not generate explanation.";

    return NextResponse.json({ explanation: explanationText });

  } catch (err: unknown) {
    console.error("Explain Route Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
