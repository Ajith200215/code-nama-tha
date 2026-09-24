import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key is not configured' }, { status: 500 });
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

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    let responseText = '';
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'CODE TO EXPLAIN:\n' + code }
        ],
        model: 'llama-3.3-70b-versatile',
      });
      responseText = completion.choices[0]?.message?.content || '';
    } catch (error: unknown) {
      console.warn("Groq API failed. Using fallback mock explain.", error);
      responseText = "# Beginner Summary\nThis code calculates the Fibonacci sequence using recursion. It returns the Nth number in the sequence.\n\n# Real-life Analogy\nImagine you want to know how many branches a tree has. You ask a branch, and it says 'I don't know, let me ask my two sub-branches and add them together.' This continues until you reach the leaves (n <= 1), which know they are just 1 branch.\n\n# Line-by-Line Breakdown\n- `if n <= 1:`: This is the base case. If we ask for the 0th or 1st number, it's just `n`.\n- `return fibonacci(n-1) + fibonacci(n-2)`: This is the recursive step. It calls itself twice to get the two previous numbers and adds them.\n\n# Simpler Alternative\nRecursion can be slow. Here is an iterative approach:\n```python\ndef fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n```\n*(Note: This is a fallback mock response due to an API error)*";
    }

    const explanationText = responseText || "Could not generate explanation.";

    return NextResponse.json({ explanation: explanationText });

  } catch (err: unknown) {
    console.error("Explain Route Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
