import { logout } from '@/app/login/actions'
import { createClient } from '@/lib/supabase/server'

export default async function ProblemsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)] p-8">
      <div className="max-w-[1280px] mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-[var(--border)] pb-4">
          <h1 className="font-mono text-2xl">Problems_</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-[var(--text-muted)]">{user?.email}</span>
            <form action={logout}>
              <button type="submit" className="text-[12px] font-mono text-[var(--accent)] hover:underline">
                [ Logout ]
              </button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-[8px]">
            <h2 className="font-mono text-lg mb-2">Arrays / Two Sum</h2>
            <div className="flex gap-2 text-[12px] font-mono text-[var(--text-muted)] mb-4">
              <span className="text-[var(--success)]">Easy</span>
              <span>• Array, Hash Table</span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Find two numbers such that they add up to a specific target number.</p>
            <button className="mt-6 px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded font-mono text-sm hover:bg-[var(--accent-glow)] transition-colors">
              Solve
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
