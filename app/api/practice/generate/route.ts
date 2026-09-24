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
  })).default([]),
  constraints: z.array(z.string()).default([]),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topics: z.array(z.string()).default([]),
  reference_solution: z.string(),
  test_cases: z.array(z.object({
    input: z.string(),
    expected_output: z.string(),
  })).default([]),
});

function extractJSON(text: string): string {
  // Strip markdown fences
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  // Extract first {...} block
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) return obj[0];
  return text.trim();
}

async function generateOneProblem(groq: Groq, topics: string[], difficulty: string, idx: number, total: number) {
  const prompt = `Generate a unique coding problem #${idx + 1} of ${total} for a learning platform.
Topics: ${topics.join(', ')}
Difficulty: ${difficulty}

Respond with ONLY a JSON object — no markdown, no explanation, no extra text. Use exactly this shape:
{"title":"Sum of Array","description":"Given array nums, return sum of all elements. Print the result.","examples":[{"input":"[1,2,3]","output":"6","explanation":"1+2+3=6"}],"constraints":["1<=n<=100","integers only"],"difficulty":"Easy","topics":["Array"],"reference_solution":"nums=list(map(int,input().split()))\\nprint(sum(nums))","test_cases":[{"input":"1 2 3","expected_output":"6"}]}

Rules:
- Python only. reference_solution reads from stdin, prints to stdout.
- Keep description under 150 chars.
- Max 2 examples, 2 test_cases, 2 constraints.
- difficulty must be exactly "Easy", "Medium", or "Hard".`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'openai/gpt-oss-20b',
    max_tokens: 700,
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const jsonStr = extractJSON(raw);
  const parsed = JSON.parse(jsonStr);
  return ProblemSchema.parse(parsed);
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topics, difficulty, count = 2 } = await req.json();
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one topic' }, { status: 400 });
    }

    // Check daily quota
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

    const difficultyLabel = difficulty === 'mixed' ? 'any (vary between Easy, Medium, Hard)' : difficulty;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Generate one problem at a time to avoid truncation
    const problems = [];
    const safeCount = Math.min(count, 5);

    for (let i = 0; i < safeCount; i++) {
      try {
        const problem = await generateOneProblem(groq, topics, difficultyLabel, i, safeCount);
        problems.push(problem);
      } catch (err: unknown) {
        console.error(`Problem ${i + 1} generation/parse failed:`, err);
        // Skip failed problems instead of crashing
      }
    }

    if (problems.length === 0) {
      return NextResponse.json({ error: 'AI failed to generate any valid problems. Please try again.' }, { status: 500 });
    }

    // Save valid problems to DB
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

      if (!error && data) saved.push({ ...p, id: data.id });
    }

    // Update quota
    await supabase.from('ai_usage').upsert({
      user_id: user.id,
      date: today,
      calls_count: currentCount + 1,
    }, { onConflict: 'user_id,date' });

    return NextResponse.json({
      problems: saved.length > 0 ? saved : problems,
      quota: { used: currentCount + 1, limit: DAILY_LIMIT },
    });

  } catch (err: unknown) {
    console.error('Practice generate error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
