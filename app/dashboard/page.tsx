'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Layers, Users, Sparkles, Brain, Trophy,
  Bell, Sun, Moon, Plus, Search, ChevronRight, Flame, Play,
  Code2, CheckCircle2, Clock, Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Design tokens applied via className / CSS vars ──────────────────────────

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--d-line)" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--d-lime)" strokeWidth="5"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dy=".35em" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--d-ink)">{value}%</text>
    </svg>
  );
}

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Problems', href: '/problems' },
  { icon: Layers, label: 'Practice Levels', href: '/problems' },
  { icon: Users, label: 'Rooms', href: '/rooms' },
  { icon: Sparkles, label: 'Code Explainer', href: '/explain' },
  { icon: Brain, label: 'AI Topics', href: '/practice' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
];

const TOPICS = ['Arrays', 'Strings', 'Recursion', 'DP'];

const TOPIC_CARDS = [
  { title: 'Arrays', count: 42, color: 'bg-[var(--d-lime-soft)]', shape: 'circle' },
  { title: 'Strings', count: 35, color: 'bg-[#E8E4FB]', shape: 'rect' },
  { title: 'Loops', count: 28, color: 'bg-[#FDE3DA]', shape: 'triangle' },
  { title: 'Recursion', count: 19, color: 'bg-[#D7F0FB]', shape: 'diamond' },
];

const LEVEL_CARDS = [
  { topic: 'Arrays', level: 2, of: 4, solved: 6, total: 10, pct: 60 },
  { topic: 'Strings', level: 1, of: 4, solved: 3, total: 10, pct: 30 },
  { topic: 'Recursion', level: 3, of: 4, solved: 9, total: 10, pct: 90 },
];

const SUBMISSIONS = [
  { title: 'Two Sum', date: 'Today, 10:32', runtime: '02 ms', passed: 9, total: 9, level: 'L0', attempts: 1, difficulty: 'Easy' },
  { title: 'Valid Parentheses', date: 'Yesterday', runtime: '04 ms', passed: 8, total: 9, level: 'L1', attempts: 2, difficulty: 'Medium' },
  { title: 'Merge Intervals', date: 'Sep 22', runtime: '12 ms', passed: 7, total: 9, level: 'L2', attempts: 3, difficulty: 'Hard' },
];

function TopicShapeSVG({ shape }: { shape: string }) {
  if (shape === 'circle') return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="var(--d-lime)" opacity="0.6" />
      <circle cx="20" cy="20" r="10" fill="var(--d-lime)" />
    </svg>
  );
  if (shape === 'rect') return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <rect x="8" y="18" width="36" height="28" rx="8" fill="#C4B8F8" opacity="0.7" />
      <rect x="22" y="10" width="28" height="20" rx="6" fill="#9C85F0" opacity="0.8" />
    </svg>
  );
  if (shape === 'triangle') return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <polygon points="32,6 58,54 6,54" fill="#F8B4A0" opacity="0.7" />
      <circle cx="44" cy="38" r="10" fill="#E0673F" opacity="0.6" />
    </svg>
  );
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <rect x="20" y="6" width="24" height="24" rx="4" transform="rotate(45 32 18)" fill="#A0D8F8" opacity="0.7" />
      <circle cx="40" cy="44" r="12" fill="#5BB8F0" opacity="0.6" />
    </svg>
  );
}

function DiffPill({ d }: { d: string }) {
  const cls =
    d === 'Easy' ? 'bg-[var(--d-easy-bg)] text-[var(--d-easy)]' :
    d === 'Medium' ? 'bg-[var(--d-med-bg)] text-[var(--d-med)]' :
    'bg-[var(--d-hard-bg)] text-[var(--d-hard)]';
  return <span className={`${cls} px-2.5 py-0.5 rounded-full text-[11px] font-semibold`}>{d}</span>;
}

function LevelChip({ l }: { l: string }) {
  return <span className="bg-[var(--d-lime-soft)] text-[var(--d-ink)] px-2.5 py-0.5 rounded-full text-[11px] font-bold">{l}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [activeTopic, setActiveTopic] = useState('Arrays');
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [submissions, setSubmissions] = useState<unknown[]>([]);
  const [stats, setStats] = useState({ easy: 0, med: 0, hard: 0, total: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return; }
      setUser(data.user);
      fetchDashboardData(supabase, data.user.id);
    });
  }, [router]);

  async function fetchDashboardData(supabase: unknown, userId: string) {
    // 1. Fetch recent submissions with problem details
    const { data: subs } = await supabase
      .from('submissions')
      .select('*, problems(title, difficulty)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (subs) {
      setSubmissions(subs.map(s => ({
        title: s.problems?.title || 'Custom Problem',
        difficulty: s.problems?.difficulty || 'Medium',
        date: new Date(s.created_at).toLocaleDateString(),
        runtime: s.execution_time ? `${s.execution_time}ms` : '-',
        status: s.status,
      })));
    }

    // 2. Fetch distinct accepted submissions for stats
    const { data: acceptedSubs } = await supabase
      .from('submissions')
      .select('problem_id, problems(difficulty)')
      .eq('user_id', userId)
      .eq('status', 'Accepted');
    
    if (acceptedSubs) {
      // deduplicate by problem_id
      const unique = new Map();
      acceptedSubs.forEach(s => {
        if (!unique.has(s.problem_id)) {
           unique.set(s.problem_id, s.problems?.difficulty || 'Medium');
        }
      });
      let easy = 0, med = 0, hard = 0;
      unique.forEach(diff => {
        if (diff === 'Easy') easy++;
        else if (diff === 'Medium') med++;
        else if (diff === 'Hard') hard++;
      });
      setStats({ easy, med, hard, total: unique.size });
    }
    
    // 3. Mock streak logic for now
    setStreak(Math.floor(Math.random() * 5) + 1);
    setLoadingStats(false);
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-dodo', dark ? 'dark' : 'light');
  }, [dark]);

  const name = user?.email?.split('@')[0] || 'Coder';

  // Today streak dates
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 6 + i);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), date: d.getDate(), isToday: i === 6, solved: i < 5 };
  });

  return (
    <div className="min-h-dvh font-[Outfit,system-ui,sans-serif]" style={{ background: 'var(--d-page)', color: 'var(--d-ink)' }}>
      <style>{`
        :root {
          --d-page:#C8CAC2; --d-panel:#FBFBF3; --d-card:#FFFFFF;
          --d-ink:#1B1B1B; --d-muted:#8A8C84; --d-line:#ECECE4;
          --d-lime:#D8F35E; --d-lime-soft:#EEF9B8;
          --d-easy-bg:#DDF6C9; --d-easy:#3E8E1F;
          --d-med-bg:#FFF1CC; --d-med:#B27A00;
          --d-hard-bg:#FDE3DA; --d-hard:#E0673F;
          --d-shadow:0 8px 30px rgba(20,20,10,.08);
        }
        [data-dodo="dark"] {
          --d-page:#0E0F0B; --d-panel:#171812; --d-card:#1F2018; --d-ink:#F4F5EC;
          --d-muted:#9A9C90; --d-line:#2A2B22; --d-lime:#D8F35E; --d-lime-soft:#2A3010;
          --d-easy-bg:#1a3012; --d-med-bg:#2d2200; --d-hard-bg:#2d1209;
        }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <aside className="w-[230px] flex-shrink-0 flex flex-col m-3 mr-0" 
               style={{ background: 'var(--d-panel)', borderRadius: 28, boxShadow: 'var(--d-shadow)' }}>
          {/* Logo */}
          <div className="px-5 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--d-ink)] font-black text-sm" style={{ background: 'var(--d-lime)' }}>
                C
              </div>
              <span className="font-bold text-[15px]">CodeArena</span>
            </div>
          </div>

          {/* User Profile Block */}
          <div className="mx-3 mb-4 p-3 rounded-[18px]" style={{ background: 'var(--d-card)', boxShadow: 'var(--d-shadow)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--d-ink)] font-bold text-sm uppercase" style={{ background: 'var(--d-lime)' }}>
                {name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px] truncate">{name}</p>
                <p className="text-[11px]" style={{ color: 'var(--d-muted)' }}>Level 2 coder</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[12px] font-semibold" style={{ color: 'var(--d-lime)' }}>
              <Flame size={12} /> {streak} day streak
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
            {NAV.map(({ icon: Icon, label, href }) => {
              const isActive = label === 'Dashboard';
              return (
                <Link key={label} href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all
                    ${isActive ? 'text-[var(--d-ink)] font-semibold' : 'hover:bg-[var(--d-line)]'}`}
                  style={isActive ? { background: 'var(--d-lime)' } : { color: 'var(--d-muted)' }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* AI Mentor dark card */}
          <div className="m-3 mt-0 p-4 rounded-[18px] relative overflow-hidden" style={{ background: 'var(--d-ink)' }}>
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--d-lime)' }}>?</div>
            <p className="text-white font-semibold text-[13px] mb-1">Stuck?</p>
            <p className="text-[11px] mb-3" style={{ color: 'var(--d-muted)' }}>Ask the AI mentor for hints.</p>
            <Link href="/explain" className="flex items-center gap-1 text-[12px] font-bold rounded-full px-3 py-1.5 w-fit transition-all hover:opacity-90" style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
              Open Explainer <ChevronRight size={12} />
            </Link>
          </div>
        </aside>

        {/* ── MAIN AREA ────────────────────────────────────────── */}
        <main className="flex-1 flex gap-3 overflow-hidden p-3">
          
          {/* Center column */}
          <div className="flex-1 flex flex-col overflow-y-auto gap-4 pr-1">
            
            {/* Top Bar */}
            <div className="flex items-center gap-3">
              {/* Topic Tabs */}
              <div className="flex gap-1 p-1 rounded-full" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                {TOPICS.map(t => (
                  <button key={t} onClick={() => setActiveTopic(t)}
                    className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all"
                    style={activeTopic === t
                      ? { background: 'var(--d-ink)', color: 'var(--d-panel)', fontWeight: 700 }
                      : { color: 'var(--d-muted)' }}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                <Search size={14} style={{ color: 'var(--d-muted)' }} />
                <input placeholder="Search problems or press ⌘K" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--d-muted)]" style={{ color: 'var(--d-ink)' }} />
              </div>

              {/* Theme toggle */}
              <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)', color: 'var(--d-muted)' }}>
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Create Room CTA */}
              <Link href="/rooms" className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:opacity-90 whitespace-nowrap" style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}>
                <Plus size={14} /> Create Room
              </Link>
            </div>

            {/* Hero Greeting */}
            <div className="p-7 rounded-[28px] flex items-center justify-between" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
              <div>
                <h1 className="text-[28px] font-bold leading-tight">
                  Hi, {name}! What do you want to{' '}
                  <span className="px-2 rounded-lg" style={{ background: 'var(--d-lime)' }}>solve</span>{' '}
                  today?
                </h1>
                <p className="mt-2 text-[14px]" style={{ color: 'var(--d-muted)' }}>Pick a level, write the code, and level up.</p>
                <Link href="/problems" className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold transition-all hover:opacity-90" style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                  <Play size={13} /> Start Solving
                </Link>
              </div>
              <div className="hidden lg:flex items-center gap-3 text-center">
                {[{ label: 'Solved', val: 24 }, { label: 'Streak', val: `${streak}🔥` }, { label: 'Rank', val: '#142' }].map(s => (
                  <div key={s.label} className="px-5 py-4 rounded-[18px]" style={{ background: 'var(--d-card)', boxShadow: 'var(--d-shadow)' }}>
                    <p className="text-[22px] font-bold">{s.val}</p>
                    <p className="text-[11px]" style={{ color: 'var(--d-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Cards */}
            <div className="grid grid-cols-4 gap-3">
              {TOPIC_CARDS.map(tc => (
                <Link key={tc.title} href="/problems"
                  className="p-5 rounded-[22px] flex flex-col gap-3 hover:scale-[1.02] transition-transform cursor-pointer"
                  style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                  <div className={`w-16 h-16 rounded-[14px] flex items-center justify-center ${tc.color}`}>
                    <TopicShapeSVG shape={tc.shape} />
                  </div>
                  <div>
                    <p className="font-semibold text-[14px]">{tc.title}</p>
                    <p className="text-[12px]" style={{ color: 'var(--d-muted)' }}>{tc.count} problems</p>
                  </div>
                </Link>
              ))}
              {/* Dashed AI card */}
              <Link href="/practice"
                className="p-5 rounded-[22px] flex flex-col items-center justify-center gap-2 hover:bg-[var(--d-lime-soft)] transition-colors cursor-pointer col-span-1"
                style={{ border: '2px dashed var(--d-line)', color: 'var(--d-muted)' }}>
                <Plus size={22} />
                <p className="text-[12px] font-medium text-center">Generate AI Problems</p>
              </Link>
            </div>

            {/* Level Progress Cards */}
            <div>
              <h2 className="font-bold text-[16px] mb-3">My Progress</h2>
              <div className="grid grid-cols-3 gap-3">
                {LEVEL_CARDS.map(lc => (
                  <div key={lc.topic} className="p-5 rounded-[22px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-[15px]">{lc.topic}</p>
                        <p className="text-[12px]" style={{ color: 'var(--d-muted)' }}>Level {lc.level} of {lc.of}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--d-muted)' }}>{lc.solved}/{lc.total} solved</p>
                      </div>
                      <ProgressRing value={lc.pct} />
                    </div>
                    <Link href="/problems" className="w-full flex items-center justify-center gap-1 py-2 rounded-full text-[13px] font-semibold transition-all hover:opacity-90" style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                      Continue <ChevronRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Problems */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-[16px]">Today&apos;s Problems</h2>
                <Link href="/problems" className="text-[12px] font-medium hover:underline" style={{ color: 'var(--d-muted)' }}>See all</Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Dark card */}
                <div className="p-5 rounded-[22px]" style={{ background: 'var(--d-ink)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>Room Daily</span>
                    <Zap size={14} style={{ color: 'var(--d-lime)' }} />
                  </div>
                  <p className="font-bold text-white text-[15px] mb-1">Two Sum</p>
                  <div className="flex items-center gap-2 mb-4">
                    <DiffPill d="Easy" />
                    <LevelChip l="L0" />
                  </div>
                  <Link href="/problems/two-sum" className="flex items-center gap-1 text-[12px] font-bold" style={{ color: 'var(--d-lime)' }}>
                    Solve now <ChevronRight size={12} />
                  </Link>
                </div>
                {/* Light card */}
                <div className="p-5 rounded-[22px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--d-lime-soft)', color: 'var(--d-ink)' }}>AI Generated</span>
                    <Brain size={14} style={{ color: 'var(--d-muted)' }} />
                  </div>
                  <p className="font-bold text-[15px] mb-1">Array Rotation Challenge</p>
                  <div className="flex items-center gap-2 mb-4">
                    <DiffPill d="Medium" />
                    <LevelChip l="L2" />
                  </div>
                  <Link href="/problems" className="flex items-center gap-1 text-[12px] font-bold" style={{ color: 'var(--d-muted)' }}>
                    Solve now <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* My Submissions */}
            <div className="mb-4">
              <h2 className="font-bold text-[16px] mb-3">My Submissions</h2>
              <div className="rounded-[22px] overflow-hidden" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                {SUBMISSIONS.map((s, i) => (
                  <div key={s.title} className={`flex items-center gap-4 px-5 py-4 ${i < SUBMISSIONS.length - 1 ? 'border-b' : ''}`} style={{ borderColor: 'var(--d-line)' }}>
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--d-lime-soft)' }}>
                      <Code2 size={15} style={{ color: 'var(--d-ink)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[13px]">{s.title}</p>
                        <DiffPill d={s.difficulty} />
                        <LevelChip l={s.level} />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px]" style={{ color: 'var(--d-muted)' }}>{s.date}</span>
                        <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--d-muted)' }}><Clock size={10} /> {s.runtime}</span>
                        <span className="text-[11px]" style={{ color: 'var(--d-muted)' }}>{s.attempts} attempt{s.attempts > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <CheckCircle2 size={12} style={{ color: 'var(--d-easy)' }} />
                        <span className="font-bold text-[13px]">{s.passed}/{s.total}</span>
                      </div>
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--d-line)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(s.passed / s.total) * 100}%`, background: 'var(--d-lime)' }} />
                      </div>
                    </div>
                  </div>
                ))}
                {/* Generate AI problem row */}
                <Link href="/practice" className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--d-lime-soft)] transition-colors" style={{ borderTop: '1px dashed var(--d-line)' }}>
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ border: '1.5px dashed var(--d-muted)' }}>
                    <Plus size={14} style={{ color: 'var(--d-muted)' }} />
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: 'var(--d-muted)' }}>Generate new AI problem</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────────── */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
            
            {/* Streak Calendar */}
            <div className="p-5 rounded-[22px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
              <h3 className="font-bold text-[14px] mb-4">Streak Calendar</h3>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map((d) => (
                  <div key={d.date} className="flex flex-col items-center gap-1">
                    <span className="text-[10px]" style={{ color: 'var(--d-muted)' }}>{d.day}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold relative`}
                      style={d.isToday
                        ? { background: 'var(--d-lime)', color: 'var(--d-ink)' }
                        : { color: 'var(--d-muted)' }}>
                      {d.date}
                      {d.solved && !d.isToday && (
                        <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--d-lime)' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Daily problem', time: 'Every day' },
                  { label: 'Weekly Sprint room', time: 'Sun · 10:30 AM' },
                ].map(e => (
                  <div key={e.label} className="flex items-center gap-3 p-2.5 rounded-[12px]" style={{ background: 'var(--d-card)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--d-lime)' }} />
                    <div>
                      <p className="text-[12px] font-medium">{e.label}</p>
                      <p className="text-[10px]" style={{ color: 'var(--d-muted)' }}>{e.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="p-5 rounded-[22px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[14px] flex items-center gap-2">
                  <Bell size={14} /> Notifications
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>3</span>
                </h3>
                <button className="text-[11px]" style={{ color: 'var(--d-muted)' }}>Clear</button>
              </div>
              <div className="space-y-2">
                {[
                  { msg: 'Rahul solved Two Sum in 4 min', time: '2m ago' },
                  { msg: 'New daily problem posted', time: '1h ago' },
                  { msg: 'You hit a 7-day streak! 🔥', time: 'Today' },
                ].map(n => (
                  <div key={n.msg} className="p-3 rounded-[12px] text-[12px]" style={{ background: 'var(--d-card)' }}>
                    <p className="font-medium leading-snug">{n.msg}</p>
                    <p className="mt-0.5" style={{ color: 'var(--d-muted)' }}>{n.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Card */}
            <div className="p-5 rounded-[22px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
              <h3 className="font-bold text-[14px] mb-1">Squad Grind</h3>
              <p className="text-[12px] mb-4" style={{ color: 'var(--d-muted)' }}>You&apos;re <span className="font-bold" style={{ color: 'var(--d-ink)' }}>#3</span> on the leaderboard</p>
              <div className="flex gap-2">
                <Link href="/rooms" className="flex-1 text-center py-2 rounded-full text-[12px] font-semibold transition-all hover:bg-[var(--d-line)]" style={{ border: '1.5px solid var(--d-line)', color: 'var(--d-ink)' }}>
                  Leaderboard
                </Link>
                <Link href="/rooms" className="flex-1 text-center py-2 rounded-full text-[12px] font-semibold transition-all hover:opacity-90" style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                  Open Room
                </Link>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
