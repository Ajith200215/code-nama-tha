import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: problems, error } = await supabase
      .from('custom_problems')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('calls_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    return NextResponse.json({
      problems: problems || [],
      quota: { used: usage?.calls_count || 0, limit: 5 },
    });
  } catch (err: unknown) {
    console.error('Get practice problems error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
