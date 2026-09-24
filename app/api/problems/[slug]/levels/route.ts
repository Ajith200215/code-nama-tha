import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const LevelsSchema = z.object({
  levels: z.array(z.object({
    level: z.number(),
    template_code: z.string(),
    hints: z.array(z.string()),
  }))
});

function extractJSON(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) return obj[0];
  return text.trim();
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = params;
    
    // Fetch problem details
    const { data: problem } = await supabase
      .from('problems')
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });

    // Check if levels already exist (other than level 0)
    const { data: existingLevels } = await supabase
      .from('problem_levels')
      .select('*')
      .eq('problem_id', problem.id);
      
    if (existingLevels && existingLevels.length >= 4) {
      return NextResponse.json({ levels: existingLevels });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("No Gemini API key available");

    const prompt = `You are an expert coding instructor. Generate the 4 levels of assistance for the following problem.
Problem: ${problem.title}
Description: ${problem.description}
Difficulty: ${problem.difficulty}

Respond with ONLY a JSON object exactly matching this shape:
{"levels":[{"level":3,"template_code":"...","hints":["..."]},{"level":2,"template_code":"...","hints":["..."]},{"level":1,"template_code":"...","hints":["..."]},{"level":0,"template_code":"...","hints":[]}]}

Rules:
- Python only. Code must read from sys.stdin and print to stdout.
- MUST INCLUDE exactly 4 objects for levels 3, 2, 1, 0:
  * L3: ~80% of reference solution, comment on EVERY line explaining logic, small blanks with '# TODO'.
  * L2: ~40% of reference solution, line-by-line comments, larger blanks.
  * L1: zero code, only comments providing clear step-by-step pseudo-code guidance.
  * L0: empty starter code (just basic stdin read).`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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

    if (!res.ok) throw new Error("Gemini API error");

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = JSON.parse(extractJSON(rawText));
    const validated = LevelsSchema.parse(parsed);

    // Save to DB so we don't have to generate it again
    for (const lvl of validated.levels) {
      // Use service role key to insert if RLS blocks anon (wait, we can't easily here without service key)
      // Since RLS blocks insert to problem_levels for standard problems, we will just return it directly!
    }

    return NextResponse.json({ levels: validated.levels });

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
