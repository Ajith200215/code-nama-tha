'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Users, ArrowRight, Copy, Check, Trophy, LogIn } from 'lucide-react';
import Shell from '@/components/shell';

interface Room {
  id: string;
  name: string;
  code: string;
  created_by: string;
  expires_at: string;
  created_at: string;
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    const res = await fetch('/api/rooms');
    const data = await res.json();
    if (res.ok) setRooms(data.rooms || []);
    setIsLoading(false);
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    setIsCreating(true); setError(null);
    const res = await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newRoomName, duration_days: 30 }) });
    const data = await res.json();
    if (res.ok) { setShowCreate(false); setNewRoomName(''); router.push(`/rooms/${data.room.code}`); }
    else { setError(data.error || 'Failed to create room'); setIsCreating(false); }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true); setError(null);
    const res = await fetch(`/api/rooms/${joinCode.trim().toUpperCase()}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) { router.push(`/rooms/${data.room.code}`); }
    else { setError(data.error || 'Room not found'); setIsJoining(false); }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Shell>
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold mb-1" style={{ color: 'var(--d-ink)' }}>Rooms</h1>
            <p className="text-[14px]" style={{ color: 'var(--d-muted)' }}>Compete with friends. Solve daily problems. Climb the leaderboard.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowJoin(true); setShowCreate(false); setError(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all"
              style={{ border: '1.5px solid var(--d-line)', background: 'var(--d-panel)', color: 'var(--d-ink)', boxShadow: 'var(--d-shadow)' }}>
              <LogIn size={13} /> Join
            </button>
            <button onClick={() => { setShowCreate(true); setShowJoin(false); setError(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold transition-all hover:opacity-90"
              style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
              <Plus size={13} /> Create Room
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="mb-5 p-5 rounded-[22px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)', border: '1.5px solid var(--d-lime)' }}>
            <h2 className="font-bold text-[15px] mb-3" style={{ color: 'var(--d-ink)' }}>Create a New Room</h2>
            <div className="flex gap-3">
              <input type="text" placeholder="Room name (e.g. 'Squad Grind')" value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createRoom()}
                className="flex-1 px-4 py-2.5 rounded-full text-[13px] outline-none"
                style={{ background: 'var(--d-card)', border: '1.5px solid var(--d-line)', color: 'var(--d-ink)' }} autoFocus />
              <button onClick={createRoom} disabled={isCreating || !newRoomName.trim()}
                className="px-5 py-2 rounded-full text-[13px] font-bold disabled:opacity-50 transition-all hover:opacity-90"
                style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}>
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-3 py-2 text-[13px]" style={{ color: 'var(--d-muted)' }}>Cancel</button>
            </div>
            {error && <p className="text-[12px] mt-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--d-hard-bg)', color: 'var(--d-hard)' }}>{error}</p>}
          </div>
        )}

        {/* Join Form */}
        {showJoin && (
          <div className="mb-5 p-5 rounded-[22px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
            <h2 className="font-bold text-[15px] mb-3" style={{ color: 'var(--d-ink)' }}>Join a Room</h2>
            <div className="flex gap-3">
              <input type="text" placeholder="6-CHAR CODE" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
                maxLength={6}
                className="flex-1 px-4 py-2.5 rounded-full text-[18px] tracking-[0.4em] text-center uppercase outline-none font-bold"
                style={{ background: 'var(--d-card)', border: '1.5px solid var(--d-line)', color: 'var(--d-ink)' }} autoFocus />
              <button onClick={joinRoom} disabled={isJoining || joinCode.length < 6}
                className="px-5 py-2 rounded-full text-[13px] font-bold disabled:opacity-50 transition-all hover:opacity-90"
                style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}>
                {isJoining ? 'Joining...' : 'Join'}
              </button>
              <button onClick={() => setShowJoin(false)} className="px-3 py-2 text-[13px]" style={{ color: 'var(--d-muted)' }}>Cancel</button>
            </div>
            {error && <p className="text-[12px] mt-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--d-hard-bg)', color: 'var(--d-hard)' }}>{error}</p>}
          </div>
        )}

        {/* Rooms List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--d-lime) transparent var(--d-lime) var(--d-lime)' }} />
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-center rounded-[22px]"
            style={{ border: '2px dashed var(--d-line)', color: 'var(--d-muted)' }}>
            <Users size={36} className="mb-3 opacity-40" />
            <p className="font-semibold text-[14px]" style={{ color: 'var(--d-ink)' }}>No rooms yet</p>
            <p className="text-[13px] mt-1">Create a room or join with a code</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {rooms.map(room => (
              <div key={room.id} className="group flex items-center justify-between p-5 rounded-[22px] transition-all hover:shadow-lg"
                style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                    style={{ background: 'var(--d-lime-soft)' }}>
                    <Trophy size={18} style={{ color: 'var(--d-ink)' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px]" style={{ color: 'var(--d-ink)' }}>{room.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="font-mono text-[12px] font-bold tracking-widest" style={{ color: 'var(--d-lime)' }}>{room.code}</span>
                      <button onClick={() => copyCode(room.code)} style={{ color: 'var(--d-muted)' }} title="Copy invite link">
                        {copiedCode === room.code ? <Check size={12} style={{ color: 'var(--d-easy)' }} /> : <Copy size={12} />}
                      </button>
                      <span className="text-[11px]" style={{ color: 'var(--d-muted)' }}>
                        Expires {new Date(room.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/rooms/${room.code}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-bold opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                  Enter <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
