import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Join a room by code
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await params;

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (roomError || !room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    // Check if already a member
    const { data: existing } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      await supabase.from('room_members').insert({ room_id: room.id, user_id: user.id });
    }

    return NextResponse.json({ room });
  } catch (err: unknown) {
    console.error('Join Room Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Get room details by code
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await params;

    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    // Get members with their profiles
    const { data: members } = await supabase
      .from('room_members')
      .select('user_id, joined_at, profiles(email)')
      .eq('room_id', room.id);

    // Get scores
    const { data: scores } = await supabase
      .from('room_scores')
      .select('user_id, score, profiles(email)')
      .eq('room_id', room.id)
      .order('score', { ascending: false });

    return NextResponse.json({ room, members, scores });
  } catch (err: unknown) {
    console.error('Get Room Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
