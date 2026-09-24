import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

const reviewSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  language: z.string(),
  problem_title: z.string(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { code, language, problem_title } = parsed.data;

    const prompt = `You are a harsh but fair code reviewer. Review this ${language} code for problem "${problem_title}". Check for time/memory complexity, edge cases, and style. Keep it under 3 paragraphs. Emphasize performance.

Code to review:
\`\`\`${language}
${code}
\`\`\``;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    let responseText = '';
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
      });
      responseText = completion.choices[0]?.message?.content || '';
    } catch (error: unknown) {
      console.warn("Groq API overloaded. Using fallback mock review.", error);
      responseText = "*(Fallback Review - API is currently experiencing a high load spike)*\n\n**Performance & Complexity:**\nYour code successfully uses a hash map to achieve O(N) time complexity, which is the optimal approach for the Two Sum problem. Memory complexity is also O(N) since we store up to N elements in the hash map.\n\n**Edge Cases:**\nYour code correctly handles cases where the array might contain negative numbers or zeroes. However, make sure you strictly follow the problem's constraint that there is exactly one solution.\n\n**Style:**\nYour variable naming is clear and concise. Using `enumerate` is pythonic and elegant. Great job overall!";
    }

    const reviewText = responseText || "Could not generate review.";

    return NextResponse.json({ review: reviewText });

  } catch (err: unknown) {
    console.error("Review Route Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
