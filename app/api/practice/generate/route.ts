import { NextResponse } from 'next/server';
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
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) return obj[0];
  return text.trim();
}

async function generateOneProblem(topics: string[], difficulty: string, idx: number, total: number, providedApiKey?: string, provider: 'Gemini' | 'Groq' = 'Gemini') {
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

  if (provider === 'Groq') {
    const apiKey = providedApiKey || process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("No Groq API key available");
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    if (!groqRes.ok) throw new Error(`Groq Error: ${groqRes.status} ${await groqRes.text()}`);
    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content || '{}';
    return ProblemSchema.parse(JSON.parse(extractJSON(raw)));
  }

  // Default to Gemini
  const apiKey = providedApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No Gemini API key available");

  const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash-preview', 'gemini-2.0-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API Error (${model}): ${res.status} ${errorText}`);
      }

      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      const jsonStr = extractJSON(raw);
      const parsed = JSON.parse(jsonStr);
      return ProblemSchema.parse(parsed);
    } catch (err) {
      lastError = err;
      console.warn(`Model ${model} failed, trying next...`, (err as Error).message);
    }
  }

  throw lastError;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topics, difficulty, count = 2, apiKey, provider = 'Gemini' } = await req.json();
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one topic' }, { status: 400 });
    }

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
    const problems = [];
    const safeCount = Math.min(count, 5);

    for (let i = 0; i < safeCount; i++) {
      try {
        const problem = await generateOneProblem(topics, difficultyLabel, i, safeCount, apiKey, provider);
        problems.push(problem);
      } catch (err: unknown) {
        console.error(`Problem ${i + 1} generation/parse failed:`, err instanceof Error ? err.message : err);
      }
    }

    if (problems.length === 0) {
      // Fallback: If all APIs fail (due to rate limits, invalid keys, etc.), provide a mock problem so the UI doesn't break
      console.warn('All AI generations failed. Falling back to mock problem.');
      problems.push({
        title: "Find the Maximum Element",
        description: "Given an array of integers, write a function to find and print the maximum element in the array.",
        examples: [
          { input: "1 5 3 9 2", output: "9", explanation: "9 is the largest number in the array." }
        ],
        constraints: ["1 <= array.length <= 100", "array elements are integers"],
        difficulty: difficultyLabel.includes('Hard') ? 'Hard' : (difficultyLabel.includes('Medium') ? 'Medium' : 'Easy'),
        topics: topics.length > 0 ? topics : ["Array", "Math"],
        reference_solution: "nums = list(map(int, input().split()))\nprint(max(nums))",
        test_cases: [
          { input: "1 5 3 9 2", expected_output: "9" },
          { input: "-5 -1 -10", expected_output: "-1" }
        ]
      });
    }

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
