import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, duration_days } = await req.json();
    if (!name) return NextResponse.json({ error: 'Room name is required' }, { status: 400 });

    const code = generateRoomCode();
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + (duration_days || 30));

    const { data: room, error } = await supabase
      .from('rooms')
      .insert({ name, code, created_by: user.id, expires_at: expires_at.toISOString() })
      .select()
      .single();

    if (error) throw error;

    // Auto-join creator as a member
    await supabase.from('room_members').insert({ room_id: room.id, user_id: user.id });

    return NextResponse.json({ room });
  } catch (err: unknown) {
    console.error('Create Room Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: memberships } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', user.id);

    const roomIds = memberships?.map(m => m.room_id) || [];
    if (roomIds.length === 0) return NextResponse.json({ rooms: [] });

    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .in('id', roomIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ rooms });
  } catch (err: unknown) {
    console.error('Get Rooms Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
