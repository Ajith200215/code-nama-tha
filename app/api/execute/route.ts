import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const executeSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  language: z.enum(['python', 'javascript', 'cpp', 'java']),
  problem_id: z.string().uuid("Invalid problem ID").optional(),
});

// Map languages to Piston versions
const PISTON_VERSIONS: Record<string, string> = {
  python: '3.10.0',
  javascript: '18.15.0',
  cpp: '10.2.0',
  java: '15.0.2',
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = executeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { code, language, problem_id } = parsed.data;

    let testCases = [];
    if (problem_id) {
      const { data, error } = await supabase
        .from('test_cases')
        .select('*')
        .eq('problem_id', problem_id);

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch test cases' }, { status: 500 });
      }
      testCases = data;
    } else {
      // Default dummy test case if no problem ID is provided
      testCases = [{ input: '', expected_output: '', is_hidden: false }];
    }

    const version = PISTON_VERSIONS[language];
    const finalResults = [];

    // Piston doesn't have a batch API out of the box, so we run them sequentially 
    // or in parallel using Promise.all
    const executionPromises = testCases.map(async (tc) => {
      const payload = {
        language,
        version,
        files: [{ content: code }],
        stdin: tc.input,
        run_timeout: 3000,
      };

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Piston execution failed');
      }

      const result = await response.json();
      const output = result.run.output || '';
      
      // Basic check: clean whitespace and compare
      const cleanOutput = output.trim();
      const cleanExpected = tc.expected_output.trim();
      const isPass = result.run.code === 0 && cleanOutput === cleanExpected;

      const out = {
        passed: isPass,
        status: result.run.code === 0 ? (isPass ? 'Accepted' : 'Wrong Answer') : 'Runtime Error',
        output: cleanOutput,
        expected: tc.expected_output,
        input: tc.input,
      };

      if (tc.is_hidden && !isPass) {
        out.expected = 'Hidden';
        out.input = 'Hidden';
        out.output = 'Hidden output';
      }

      return out;
    });

    const results = await Promise.all(executionPromises);

    return NextResponse.json({ results });

  } catch (err: any) {
    console.error("Execute Route Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
