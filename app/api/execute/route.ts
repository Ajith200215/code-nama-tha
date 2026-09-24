import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import util from 'util';

const execPromise = util.promisify(exec);

const executeSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  language: z.enum(['python', 'javascript', 'cpp', 'java']),
  problem_id: z.string().uuid("Invalid problem ID").optional(),
  testCases: z.array(z.object({
    input: z.string(),
    expected_output: z.string(),
    is_hidden: z.boolean().optional().default(false)
  })).optional(),
});

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

    const { code, language, problem_id, testCases: clientTestCases } = parsed.data;

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
    } else if (clientTestCases && clientTestCases.length > 0) {
      testCases = clientTestCases;
    } else {
      testCases = [{ input: '', expected_output: '', is_hidden: false }];
    }

    // Local Execution fallback (works great for python development!)
    const executionPromises = testCases.map(async (tc) => {
      if (language !== 'python') {
        return { passed: false, status: 'Error', output: 'Local execution currently only supports Python.', expected: tc.expected_output, input: tc.input };
      }

      const fileId = uuidv4();
      const filePath = join(os.tmpdir(), `code_${fileId}.py`);
      
      try {
        await writeFile(filePath, code);
        
        // Escape quotes in input to pass to python via echo, or pass via env var/stdin
        // Since we are running local, we can use stdin via a small wrapper or just simple shell pipe
        // To be safe on windows, we can write input to a file and read it
        const inputPath = join(os.tmpdir(), `input_${fileId}.txt`);
        await writeFile(inputPath, tc.input);

        const { stdout, stderr } = await execPromise(`python "${filePath}" < "${inputPath}"`, { timeout: 3000 });
        
        const cleanOutput = (stdout || stderr).trim();
        const cleanExpected = tc.expected_output.trim();
        const isPass = !stderr && cleanOutput === cleanExpected;

        // Cleanup
        await unlink(filePath).catch(() => {});
        await unlink(inputPath).catch(() => {});

        const out = {
          passed: isPass,
          status: isPass ? 'Accepted' : (stderr ? 'Runtime Error' : 'Wrong Answer'),
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

      } catch (err: any) {
        // Cleanup
        await unlink(filePath).catch(() => {});
        return {
          passed: false,
          status: 'Runtime Error',
          output: err.stderr || err.message,
          expected: tc.expected_output,
          input: tc.input,
        };
      }
    });

    const results = await Promise.all(executionPromises);
    
    const allPassed = results.every(r => r.passed);

    // If it's a real problem and everything passed, record the submission
    if (problem_id && allPassed && user) {
      // In a real app we would pass `level` from the client and record it specifically.
      await supabase.from('submissions').insert({
        user_id: user.id,
        problem_id: problem_id,
        code: code,
        language: language,
        status: 'accepted'
      });
    }

    return NextResponse.json({ results, allPassed });

  } catch (err: unknown) {
    console.error("Execute Route Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
