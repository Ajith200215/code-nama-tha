'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4" style={{ background: 'var(--d-page)' }}>
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center font-black text-base"
            style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>C</div>
          <span className="font-bold text-[18px]" style={{ color: 'var(--d-ink)' }}>CodeArena</span>
        </Link>

        {/* Card */}
        <div className="p-8 rounded-[28px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
          <h1 className="text-[26px] font-bold mb-1" style={{ color: 'var(--d-ink)' }}>Welcome back</h1>
          <p className="text-[14px] mb-7" style={{ color: 'var(--d-muted)' }}>Sign in to continue solving</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--d-ink)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-[12px] text-[14px] outline-none transition-all"
                style={{ background: 'var(--d-card)', border: '1.5px solid var(--d-line)', color: 'var(--d-ink)' }}
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--d-ink)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-[12px] text-[14px] outline-none transition-all"
                style={{ background: 'var(--d-card)', border: '1.5px solid var(--d-line)', color: 'var(--d-ink)' }}
                required
              />
            </div>
            {error && <p className="text-[13px] px-3 py-2 rounded-[10px]" style={{ background: 'var(--d-hard-bg)', color: 'var(--d-hard)' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-[14px] font-bold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-[13px]" style={{ color: 'var(--d-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold hover:underline" style={{ color: 'var(--d-ink)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
