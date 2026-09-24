'use client';

import Link from 'next/link';
import { ArrowRight, Code2, Users, Sparkles, Brain, Layers, Play, Star } from 'lucide-react';

function TopicShapeSVG({ shape }: { shape: string }) {
  if (shape === 'circle') return (
    <svg width="48" height="48" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#D8F35E" opacity="0.5" />
      <circle cx="20" cy="20" r="10" fill="#D8F35E" />
    </svg>
  );
  if (shape === 'rect') return (
    <svg width="48" height="48" viewBox="0 0 64 64">
      <rect x="8" y="18" width="36" height="28" rx="8" fill="#C4B8F8" opacity="0.7" />
      <rect x="22" y="10" width="28" height="20" rx="6" fill="#9C85F0" opacity="0.8" />
    </svg>
  );
  if (shape === 'triangle') return (
    <svg width="48" height="48" viewBox="0 0 64 64">
      <polygon points="32,6 58,54 6,54" fill="#F8B4A0" opacity="0.7" />
      <circle cx="44" cy="38" r="10" fill="#E0673F" opacity="0.6" />
    </svg>
  );
  return (
    <svg width="48" height="48" viewBox="0 0 64 64">
      <rect x="20" y="6" width="24" height="24" rx="4" transform="rotate(45 32 18)" fill="#A0D8F8" opacity="0.7" />
      <circle cx="40" cy="44" r="12" fill="#5BB8F0" opacity="0.6" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh" style={{ background: 'var(--d-page)', color: 'var(--d-ink)', fontFamily: 'Outfit, system-ui, sans-serif' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 mx-4 mt-4 rounded-[22px]"
        style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>C</div>
          <span className="font-bold text-[16px]">CodeArena</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[14px]" style={{ color: 'var(--d-muted)' }}>
          <Link href="/problems" className="hover:text-[var(--d-ink)] transition-colors">Problems</Link>
          <Link href="/rooms" className="hover:text-[var(--d-ink)] transition-colors">Rooms</Link>
          <Link href="/explain" className="hover:text-[var(--d-ink)] transition-colors">Explainer</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
            style={{ color: 'var(--d-muted)' }}>Log in</Link>
          <Link href="/signup" className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-8"
          style={{ background: 'var(--d-lime-soft)', color: 'var(--d-ink)' }}>
          <Star size={12} fill="currentColor" /> Guided learning · 4 levels of help
        </div>
        <h1 className="text-[clamp(42px,7vw,80px)] font-bold leading-[1.1] mb-6">
          Code smarter, not<br />
          just <span className="px-3 rounded-[14px]" style={{ background: 'var(--d-lime)' }}>harder</span>
        </h1>
        <p className="text-[18px] max-w-[500px] mx-auto mb-10" style={{ color: 'var(--d-muted)' }}>
          A coding platform that actually teaches you. Pick a level, write the code, get AI feedback — and actually level up.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-bold transition-all hover:opacity-90"
            style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}>
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/problems"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold transition-all hover:bg-[var(--d-lime-soft)]"
            style={{ border: '2px solid var(--d-line)', color: 'var(--d-ink)' }}>
            <Play size={14} /> Browse problems
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mt-14 flex-wrap">
          {[
            { val: '200+', label: 'Problems' },
            { val: '4', label: 'Difficulty Levels' },
            { val: 'AI', label: 'Code Review' },
            { val: '∞', label: 'Rooms' },
          ].map(s => (
            <div key={s.label} className="px-6 py-4 rounded-[18px] text-center"
              style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
              <p className="text-[26px] font-bold" style={{ color: 'var(--d-ink)' }}>{s.val}</p>
              <p className="text-[12px]" style={{ color: 'var(--d-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-[1100px] mx-auto px-6 pb-20">
        <h2 className="text-[clamp(28px,4vw,40px)] font-bold text-center mb-12">Everything you need to get good</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Layers, title: '4 Levels of Help', desc: 'From 90% code (L3) down to blank slate (L0). Choose your challenge, switch anytime.', shape: 'circle', color: 'bg-[var(--d-lime-soft)]' },
            { icon: Code2, title: 'AI Code Review', desc: 'Solve at Level 0? Get a real AI review — complexity analysis, best practices, side-by-side diff.', shape: 'rect', color: 'bg-[#E8E4FB]' },
            { icon: Sparkles, title: 'Code Explainer', desc: 'Paste any confusing code. Get a beginner-friendly breakdown with analogies and alternatives.', shape: 'triangle', color: 'bg-[#FDE3DA]' },
            { icon: Users, title: 'Custom Rooms', desc: 'Create a room, invite friends, race daily problems, and track scores on a live leaderboard.', shape: 'diamond', color: 'bg-[#D7F0FB]' },
            { icon: Brain, title: 'AI Topic Practice', desc: 'Enter your weak topics and let AI generate a custom problem set just for you.', shape: 'circle', color: 'bg-[var(--d-lime-soft)]' },
            { icon: Play, title: 'Run & Submit', desc: 'Write code in Monaco Editor, run against test cases, and see results instantly.', shape: 'rect', color: 'bg-[#E8E4FB]' },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-[22px] hover:scale-[1.02] transition-transform"
              style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
              <div className={`w-14 h-14 rounded-[14px] flex items-center justify-center mb-4 ${f.color}`}>
                <TopicShapeSVG shape={f.shape} />
              </div>
              <h3 className="font-bold text-[16px] mb-2">{f.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--d-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Level System CTA */}
      <section className="max-w-[1100px] mx-auto px-6 pb-20">
        <div className="p-10 rounded-[28px] flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}>
          <div>
            <h2 className="text-[32px] font-bold mb-3">Ready to actually get better?</h2>
            <p className="text-[15px] opacity-70 max-w-[400px]">Stop brute-forcing LeetCode. Use our guided system to understand every line.</p>
          </div>
          <Link href="/signup"
            className="flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-bold whitespace-nowrap transition-all hover:opacity-90"
            style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-4 mb-4 px-8 py-6 rounded-[22px] flex items-center justify-between flex-wrap gap-4"
        style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center font-black text-xs"
            style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>C</div>
          <span className="font-bold text-[13px]">CodeArena</span>
        </div>
        <p className="text-[12px]" style={{ color: 'var(--d-muted)' }}>© 2026 CodeArena. Learn, solve, level up.</p>
        <div className="flex gap-4 text-[12px]" style={{ color: 'var(--d-muted)' }}>
          <Link href="/problems" className="hover:text-[var(--d-ink)] transition-colors">Problems</Link>
          <Link href="/rooms" className="hover:text-[var(--d-ink)] transition-colors">Rooms</Link>
          <Link href="/explain" className="hover:text-[var(--d-ink)] transition-colors">Explainer</Link>
        </div>
      </footer>
    </div>
  );
}
