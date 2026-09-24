'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Users, ArrowRight, Copy, Check, Trophy, LogIn } from 'lucide-react';

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

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    const res = await fetch('/api/rooms');
    const data = await res.json();
    if (res.ok) setRooms(data.rooms || []);
    setIsLoading(false);
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    setIsCreating(true);
    setError(null);
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRoomName, duration_days: 30 }),
    });
    const data = await res.json();
    if (res.ok) {
      setShowCreate(false);
      setNewRoomName('');
      router.push(`/rooms/${data.room.code}`);
    } else {
      setError(data.error || 'Failed to create room');
    }
    setIsCreating(false);
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    setError(null);
    const res = await fetch(`/api/rooms/${joinCode.trim().toUpperCase()}`, {
      method: 'POST',
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/rooms/${data.room.code}`);
    } else {
      setError(data.error || 'Room not found');
      setIsJoining(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* Navbar */}
      <nav className="h-[72px] flex items-center justify-between px-[clamp(24px,6vw,92px)] border-b border-[var(--border)] bg-[var(--surface-2)]">
        <Link href="/" className="font-mono text-lg font-bold">CodeArena¬</Link>
        <div className="flex gap-6 font-mono text-[13px]">
          <Link href="/problems" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Problems</Link>
          <Link href="/explain" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Explain</Link>
          <span className="text-[var(--accent)]">[ Rooms ]</span>
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto px-[clamp(24px,6vw,92px)] py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">Rooms</h1>
            <p className="text-[var(--text-muted)]">Compete with friends. Solve daily problems. Climb the leaderboard.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowJoin(true); setShowCreate(false); setError(null); }}
              className="flex items-center gap-2 border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text)] px-4 py-2 rounded-[6px] font-mono text-[13px] transition-all"
            >
              <LogIn size={14} /> Join Room
            </button>
            <button
              onClick={() => { setShowCreate(true); setShowJoin(false); setError(null); }}
              className="flex items-center gap-2 bg-[var(--accent-strong)] hover:bg-[var(--accent)] text-black px-4 py-2 rounded-[6px] font-mono text-[13px] font-medium transition-all"
            >
              <Plus size={14} /> Create Room
            </button>
          </div>
        </div>

        {/* Create Room Form */}
        {showCreate && (
          <div className="mb-8 p-6 bg-[var(--surface)] border border-[var(--accent)] rounded-[10px] shadow-[0_0_20px_var(--accent-glow)]">
            <h2 className="font-mono font-bold text-lg mb-4">Create a New Room</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Room name (e.g. 'Squad Grind')"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createRoom()}
                className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] focus:border-[var(--accent)] text-[var(--text)] px-4 py-2 rounded-[6px] font-mono text-[13px] outline-none transition-colors"
                autoFocus
              />
              <button
                onClick={createRoom}
                disabled={isCreating || !newRoomName.trim()}
                className="bg-[var(--accent-strong)] hover:bg-[var(--accent)] text-black px-6 py-2 rounded-[6px] font-mono text-[13px] font-medium disabled:opacity-50 transition-all"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowCreate(false)} className="text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-2 font-mono text-[13px] transition-colors">Cancel</button>
            </div>
            {error && <p className="text-red-400 font-mono text-[12px] mt-2">{error}</p>}
          </div>
        )}

        {/* Join Room Form */}
        {showJoin && (
          <div className="mb-8 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[10px]">
            <h2 className="font-mono font-bold text-lg mb-4">Join a Room</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter 6-character room code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
                maxLength={6}
                className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] focus:border-[var(--accent)] text-[var(--text)] px-4 py-2 rounded-[6px] font-mono text-[18px] tracking-[0.3em] text-center outline-none transition-colors uppercase"
                autoFocus
              />
              <button
                onClick={joinRoom}
                disabled={isJoining || joinCode.length < 6}
                className="bg-[var(--accent-strong)] hover:bg-[var(--accent)] text-black px-6 py-2 rounded-[6px] font-mono text-[13px] font-medium disabled:opacity-50 transition-all"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
              <button onClick={() => setShowJoin(false)} className="text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-2 font-mono text-[13px] transition-colors">Cancel</button>
            </div>
            {error && <p className="text-red-400 font-mono text-[12px] mt-2">{error}</p>}
          </div>
        )}

        {/* Rooms List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center border border-dashed border-[var(--border)] rounded-[10px]">
            <Users size={40} className="text-[var(--text-muted)] mb-4 opacity-50" />
            <p className="font-mono text-[var(--text-muted)] mb-2">No rooms yet</p>
            <p className="text-sm text-[var(--text-muted)] opacity-60">Create a room or join one with a code to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rooms.map(room => (
              <div key={room.id} className="group flex items-center justify-between p-5 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] rounded-[10px] transition-all duration-200 hover:shadow-[0_0_20px_var(--accent-glow)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[8px] bg-[var(--accent-glow)] border border-[var(--accent)] flex items-center justify-center">
                    <Trophy size={18} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px]">{room.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-[12px] text-[var(--accent)] tracking-widest">{room.code}</span>
                      <button
                        onClick={() => copyCode(room.code)}
                        className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                        title="Copy invite link"
                      >
                        {copiedCode === room.code ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Expires {new Date(room.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/rooms/${room.code}`}
                  className="flex items-center gap-2 text-[var(--text-muted)] group-hover:text-[var(--accent)] font-mono text-[13px] transition-colors"
                >
                  Enter <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
