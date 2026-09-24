import { signup } from '../login/actions'
import Link from 'next/link'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="w-full max-w-md p-8 bg-[var(--surface)] border border-[var(--border)] rounded-[8px] shadow-[0_0_40px_var(--accent-glow)]">
        <h1 className="text-2xl font-mono font-bold mb-6 text-center">Sign — up</h1>
        
        <form className="flex flex-col gap-4" action={signup}>
          {message && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded text-sm text-center">
              {message}
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-mono text-[var(--text-muted)]" htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded focus:outline-none focus:border-[var(--accent)] font-mono text-sm"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-mono text-[var(--text-muted)]" htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded focus:outline-none focus:border-[var(--accent)] font-mono text-sm"
            />
          </div>
          
          <button 
            type="submit" 
            className="mt-4 bg-[var(--accent-strong)] text-black font-mono font-medium py-2 rounded hover:bg-[var(--accent)] transition-colors"
          >
            Create Account
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm font-mono text-[var(--text-muted)]">
          Already have an account? <Link href="/login" className="text-[var(--accent)] hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  )
}
