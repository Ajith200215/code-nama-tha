import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ProblemSchema = z.object({
  title: z.string(),
  description: z.string(),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional(),
  })),
  constraints: z.array(z.string()),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topics: z.array(z.string()),
  reference_solution: z.string(),
  test_cases: z.array(z.object({
    input: z.string(),
    expected_output: z.string(),
  })),
});

const ProblemSetSchema = z.object({
  problems: z.array(ProblemSchema),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topics, difficulty, count = 3 } = await req.json();
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one topic' }, { status: 400 });
    }

    // Check quota (5 generations per day)
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('calls_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const currentCount = usage?.calls_count || 0;
    const DAILY_LIMIT = 5;
    if (currentCount >= DAILY_LIMIT) {
      return NextResponse.json({ 
        error: `Daily limit reached (${DAILY_LIMIT} generations/day). Resets at midnight.`,
        quota: { used: currentCount, limit: DAILY_LIMIT }
      }, { status: 429 });
    }

    const difficultyRange = difficulty === 'mixed'
      ? 'a mix of Easy, Medium, and Hard'
      : difficulty;

    const prompt = `You are a coding problem generator for a learning platform. Generate exactly ${count} unique coding problems.

Topics: ${topics.join(', ')}
Difficulty: ${difficultyRange}

Return ONLY a valid JSON object matching this exact structure (no markdown, no explanation):
{
  "problems": [
    {
      "title": "Problem Title",
      "description": "Full problem description with clear requirements",
      "examples": [
        { "input": "example input", "output": "expected output", "explanation": "why" }
      ],
      "constraints": ["1 <= n <= 10^4", "array contains integers"],
      "difficulty": "Easy|Medium|Hard",
      "topics": ["Array", "Hash Map"],
      "reference_solution": "def solve(...):\\n    # complete working Python solution",
      "test_cases": [
        { "input": "exact stdin input", "expected_output": "exact stdout output" }
      ]
    }
  ]
}

Rules:
- Each problem must be solvable in Python.
- reference_solution must be a complete, working Python function + a call to print the result.
- test_cases must match what the reference_solution prints to stdout.
- Generate ${count} problems ordered from easier to harder.
- Be creative and vary the problem styles.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    let raw = '';
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-20b',
        response_format: { type: 'json_object' },
      });
      raw = completion.choices[0]?.message?.content || '{}';
    } catch (err: unknown) {
      console.error('Groq generation error:', err);
      return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 503 });
    }

    // Parse and validate
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 500 });
    }

    const validated = ProblemSetSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('Schema validation failed:', validated.error);
      return NextResponse.json({ error: 'Generated problems did not match expected format.' }, { status: 500 });
    }

    const { problems } = validated.data;

    // Save to custom_problems table
    const saved = [];
    for (const p of problems) {
      const { data, error } = await supabase.from('custom_problems').insert({
        user_id: user.id,
        title: p.title,
        description: JSON.stringify({
          description: p.description,
          examples: p.examples,
          constraints: p.constraints,
          difficulty: p.difficulty,
          topics: p.topics,
          test_cases: p.test_cases,
        }),
        reference_solution: p.reference_solution,
      }).select().single();

      if (!error && data) {
        saved.push({ ...p, id: data.id });
      }
    }

    // Update AI quota
    await supabase.from('ai_usage').upsert({
      user_id: user.id,
      date: today,
      calls_count: currentCount + 1,
    }, { onConflict: 'user_id,date' });

    return NextResponse.json({
      problems: saved,
      quota: { used: currentCount + 1, limit: DAILY_LIMIT },
    });

  } catch (err: unknown) {
    console.error('Practice generate error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
