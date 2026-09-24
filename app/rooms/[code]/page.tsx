'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { Users, Trophy, Copy, Check, ArrowLeft } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  code: string;
  created_by: string;
  expires_at: string;
}

interface Member {
  user_id: string;
  joined_at: string;
  profiles: { email: string };
}

interface Score {
  user_id: string;
  score: number;
  profiles: { email: string };
}

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchRoom = useCallback(async () => {
    const res = await fetch(`/api/rooms/${code}`);
    const data = await res.json();
    if (res.ok) {
      setRoom(data.room);
      setMembers(data.members || []);
      setScores(data.scores || []);
    } else {
      setError(data.error || 'Room not found');
    }
    setIsLoading(false);
  }, [code]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-slate-300';
    if (rank === 2) return 'text-amber-600';
    return 'text-[var(--text-muted)]';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[var(--bg)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-dvh bg-[var(--bg)] flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Room Not Found</h1>
        <p className="text-[var(--text-muted)]">{error || 'This room does not exist or you are not a member.'}</p>
        <Link href="/rooms" className="text-[var(--accent)] hover:underline font-mono text-sm">← Back to Rooms</Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* Navbar */}
      <nav className="h-[72px] flex items-center justify-between px-[clamp(24px,6vw,92px)] border-b border-[var(--border)] bg-[var(--surface-2)]">
        <Link href="/" className="font-mono text-lg font-bold">CodeArena¬</Link>
        <div className="flex gap-6 font-mono text-[13px]">
          <Link href="/rooms" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">← Rooms</Link>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-[clamp(24px,6vw,92px)] py-10">
        {/* Room Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/rooms" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <ArrowLeft size={16} />
              </Link>
              <h1 className="text-3xl font-bold">{room.name}</h1>
            </div>
            <div className="flex items-center gap-3 ml-7">
              <span className="font-mono text-[var(--accent)] tracking-widest text-lg">{room.code}</span>
              <button onClick={copyInvite} className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text)] font-mono text-[12px] transition-colors">
                {copied ? <><Check size={12} className="text-green-400" /> Copied!</> : <><Copy size={12} /> Copy Invite Link</>}
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[var(--text-muted)] font-mono">Expires</p>
            <p className="font-mono text-sm">{new Date(room.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Leaderboard */}
          <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <Trophy size={16} className="text-[var(--accent)]" />
              <h2 className="font-mono font-bold text-[14px]">Leaderboard</h2>
            </div>
            
            {scores.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                <Trophy size={32} className="text-[var(--text-muted)] mb-3" />
                <p className="font-mono text-sm text-[var(--text-muted)]">No scores yet. Start solving!</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {scores.map((s, i) => (
                  <div key={s.user_id} className={`flex items-center justify-between px-6 py-4 ${i === 0 ? 'bg-[rgba(255,200,0,0.03)]' : ''}`}>
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-lg w-8 text-center ${getRankColor(i)}`}>{getRankEmoji(i)}</span>
                      <div>
                        <p className="font-medium text-[14px]">{s.profiles?.email?.split('@')[0] || 'Unknown'}</p>
                        <p className="text-[11px] text-[var(--text-muted)] font-mono">{s.profiles?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-bold text-xl ${i === 0 ? 'text-yellow-400' : 'text-[var(--text)]'}`}>{s.score}</p>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members Panel */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <Users size={14} className="text-[var(--accent)]" />
              <h2 className="font-mono font-bold text-[14px]">Members</h2>
              <span className="ml-auto bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] font-mono text-[11px] px-2 py-0.5 rounded-full">{members.length}</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {members.map(m => (
                <div key={m.user_id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--accent-glow)] border border-[var(--accent)] flex items-center justify-center text-[10px] font-mono text-[var(--accent)] uppercase font-bold">
                    {m.profiles?.email?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium">{m.profiles?.email?.split('@')[0] || 'Unknown'}</p>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono">Joined {new Date(m.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Invite Card */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)]">
              <p className="text-[11px] text-[var(--text-muted)] font-mono mb-2">Share this code to invite:</p>
              <div className="flex items-center justify-between bg-[var(--bg)] border border-[var(--border)] rounded-[6px] px-3 py-2">
                <span className="font-mono text-[var(--accent)] tracking-[0.3em] font-bold">{room.code}</span>
                <button onClick={copyInvite} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Problems section placeholder */}
        <div className="mt-6 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[10px]">
          <h2 className="font-mono font-bold text-[14px] mb-4 flex items-center gap-2">
            <span className="text-[var(--accent)]">{'>'}</span> Today&apos;s Problems
          </h2>
          <div className="flex flex-col items-center justify-center h-32 text-center opacity-50">
            <p className="font-mono text-sm text-[var(--text-muted)]">Daily problem rotation coming soon.</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">For now, use the Problems page and race your friends!</p>
          </div>
          <div className="mt-4 flex justify-center">
            <Link
              href="/problems"
              className="flex items-center gap-2 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-glow)] px-5 py-2 rounded-[6px] font-mono text-[13px] transition-all"
            >
              Go to Problems →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
