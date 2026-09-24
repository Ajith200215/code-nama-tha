'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { Users, Trophy, Copy, Check, ArrowLeft, ChevronRight } from 'lucide-react';
import Shell from '@/components/shell';

interface Room { id: string; name: string; code: string; created_by: string; expires_at: string; }
interface Member { user_id: string; joined_at: string; profiles: { email: string }; }
interface Score { user_id: string; score: number; profiles: { email: string }; }

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
    if (res.ok) { setRoom(data.room); setMembers(data.members || []); setScores(data.scores || []); }
    else setError(data.error || 'Room not found');
    setIsLoading(false);
  }, [code]);

  useEffect(() => { fetchRoom(); }, [fetchRoom]);

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rooms/${code}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const rankEmoji = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

  if (isLoading) return (
    <Shell>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--d-lime) transparent var(--d-lime) var(--d-lime)' }} />
      </div>
    </Shell>
  );

  if (error || !room) return (
    <Shell>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
        <h1 className="text-[24px] font-bold" style={{ color: 'var(--d-ink)' }}>Room Not Found</h1>
        <p style={{ color: 'var(--d-muted)' }}>{error}</p>
        <Link href="/rooms" className="flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-semibold" style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
          <ArrowLeft size={13} /> Back to Rooms
        </Link>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <div className="max-w-[1000px] mx-auto">
        {/* Room Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/rooms" className="transition-colors hover:opacity-70" style={{ color: 'var(--d-muted)' }}>
                <ArrowLeft size={16} />
              </Link>
              <h1 className="text-[28px] font-bold" style={{ color: 'var(--d-ink)' }}>{room.name}</h1>
            </div>
            <div className="flex items-center gap-3 ml-7">
              <span className="font-mono font-bold tracking-widest text-[18px]" style={{ color: 'var(--d-lime)' }}>{room.code}</span>
              <button onClick={copyInvite} className="flex items-center gap-1 text-[12px] font-medium transition-colors hover:opacity-70" style={{ color: 'var(--d-muted)' }}>
                {copied ? <><Check size={12} style={{ color: 'var(--d-easy)' }} /> Copied!</> : <><Copy size={12} /> Copy Invite</>}
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold" style={{ color: 'var(--d-muted)' }}>EXPIRES</p>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--d-ink)' }}>{new Date(room.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Leaderboard */}
          <div className="lg:col-span-2 rounded-[22px] overflow-hidden" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--d-line)' }}>
              <Trophy size={15} style={{ color: 'var(--d-lime)' }} />
              <h2 className="font-bold text-[14px]" style={{ color: 'var(--d-ink)' }}>Leaderboard</h2>
            </div>
            {scores.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-44 text-center opacity-40">
                <Trophy size={28} className="mb-2" style={{ color: 'var(--d-muted)' }} />
                <p className="text-[13px]" style={{ color: 'var(--d-muted)' }}>No scores yet. Start solving!</p>
              </div>
            ) : (
              <div>
                {scores.map((s, i) => (
                  <div key={s.user_id} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--d-line)' }}>
                    <div className="flex items-center gap-4">
                      <span className="text-xl w-8 text-center">{rankEmoji(i)}</span>
                      <div>
                        <p className="font-semibold text-[14px]" style={{ color: 'var(--d-ink)' }}>{s.profiles?.email?.split('@')[0]}</p>
                        <p className="text-[11px]" style={{ color: 'var(--d-muted)' }}>{s.profiles?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[20px]" style={{ color: i === 0 ? '#B89B00' : 'var(--d-ink)' }}>{s.score}</p>
                      <p className="text-[11px]" style={{ color: 'var(--d-muted)' }}>points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            {/* Members */}
            <div className="rounded-[22px] overflow-hidden" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--d-line)' }}>
                <Users size={14} style={{ color: 'var(--d-lime)' }} />
                <h2 className="font-bold text-[14px]" style={{ color: 'var(--d-ink)' }}>Members</h2>
                <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--d-lime-soft)', color: 'var(--d-ink)' }}>{members.length}</span>
              </div>
              {members.map(m => (
                <div key={m.user_id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--d-line)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold uppercase"
                    style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                    {m.profiles?.email?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: 'var(--d-ink)' }}>{m.profiles?.email?.split('@')[0]}</p>
                    <p className="text-[11px]" style={{ color: 'var(--d-muted)' }}>{new Date(m.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {/* Invite box */}
              <div className="p-4" style={{ borderTop: '1px solid var(--d-line)', background: 'var(--d-card)' }}>
                <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--d-muted)' }}>SHARE CODE</p>
                <div className="flex items-center justify-between px-3 py-2 rounded-[10px]" style={{ background: 'var(--d-panel)', border: '1px solid var(--d-line)' }}>
                  <span className="font-mono font-bold tracking-[0.3em]" style={{ color: 'var(--d-lime)' }}>{room.code}</span>
                  <button onClick={copyInvite} style={{ color: 'var(--d-muted)' }} className="hover:opacity-70 transition-opacity">
                    {copied ? <Check size={13} style={{ color: 'var(--d-easy)' }} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Problems CTA */}
            <div className="p-5 rounded-[22px]" style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}>
              <p className="font-bold text-[14px] mb-1">Today&apos;s Race</p>
              <p className="text-[12px] mb-4" style={{ color: 'var(--d-muted)' }}>Compete with your room on problems.</p>
              <Link href="/problems" className="flex items-center gap-1 text-[13px] font-bold px-4 py-2 rounded-full w-fit"
                style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                Go to Problems <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
