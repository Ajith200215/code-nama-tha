'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Layers, Users, Sparkles, Brain,
  Trophy, Bell, Sun, Moon, Plus, Flame, ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Problems', href: '/problems' },
  { icon: Layers, label: 'Practice Levels', href: '/problems' },
  { icon: Users, label: 'Rooms', href: '/rooms' },
  { icon: Sparkles, label: 'Code Explainer', href: '/explain' },
  { icon: Brain, label: 'AI Topics', href: '/practice' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const streak = 7;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const name = user?.email?.split('@')[0] || 'Coder';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--d-page)' }}>
      {/* SIDEBAR */}
      <aside className="w-[230px] flex-shrink-0 flex flex-col m-3 mr-0"
        style={{ background: 'var(--d-panel)', borderRadius: 28, boxShadow: 'var(--d-shadow)' }}>
        
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>C</div>
            <span className="font-bold text-[15px]" style={{ color: 'var(--d-ink)' }}>CodeArena</span>
          </Link>
        </div>

        {/* User Block */}
        <div className="mx-3 mb-4 p-3 rounded-[18px]" style={{ background: 'var(--d-card)', boxShadow: 'var(--d-shadow)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm uppercase flex-shrink-0"
              style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
              {name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[13px] truncate" style={{ color: 'var(--d-ink)' }}>{name}</p>
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
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={label} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all"
                style={isActive
                  ? { background: 'var(--d-lime)', color: 'var(--d-ink)', fontWeight: 700 }
                  : { color: 'var(--d-muted)' }}>
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* AI Mentor dark card */}
        <div className="m-3 mt-2 p-4 rounded-[18px] relative overflow-hidden" style={{ background: 'var(--d-ink)' }}>
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>?</div>
          <p className="font-semibold text-[13px] mb-1" style={{ color: 'var(--d-panel)' }}>Stuck?</p>
          <p className="text-[11px] mb-3" style={{ color: 'var(--d-muted)' }}>Ask the AI mentor for hints.</p>
          <Link href="/explain"
            className="flex items-center gap-1 text-[12px] font-bold rounded-full px-3 py-1.5 w-fit transition-all hover:opacity-90"
            style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
            Open Explainer <ChevronRight size={12} />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT + TOPBAR */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center gap-3 p-3 pb-0">
          <div className="flex-1" />
          {/* Theme toggle */}
          <button onClick={() => setDark(!dark)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)', color: 'var(--d-muted)' }}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {/* Notifications */}
          <button className="w-9 h-9 rounded-full flex items-center justify-center relative transition-all hover:opacity-80"
            style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)', color: 'var(--d-muted)' }}>
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--d-lime)' }} />
          </button>
          {/* Create Room */}
          <Link href="/rooms"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:opacity-90 whitespace-nowrap"
            style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}>
            <Plus size={14} /> Create Room
          </Link>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-3 pt-3">
          {children}
        </div>
      </div>
    </div>
  );
}
