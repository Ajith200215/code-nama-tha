import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Shell from '@/components/shell';
import { ChevronRight } from 'lucide-react';
import { redirect } from 'next/navigation';

const MOCK_PROBLEMS = [
  { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', topics: ['Array', 'Hash Table'], solved: true },
  { slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', topics: ['String', 'Stack'], solved: false },
  { slug: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium', topics: ['Array', 'Sorting'], solved: false },
  { slug: 'longest-substring', title: 'Longest Substring Without Repeating', difficulty: 'Medium', topics: ['String', 'Sliding Window'], solved: false },
  { slug: 'binary-search', title: 'Binary Search', difficulty: 'Easy', topics: ['Array', 'Binary Search'], solved: true },
  { slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', topics: ['DP', 'Math'], solved: false },
  { slug: 'word-break', title: 'Word Break', difficulty: 'Medium', topics: ['DP', 'String'], solved: false },
  { slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium', topics: ['DP', 'Array'], solved: false },
  { slug: 'lru-cache', title: 'LRU Cache', difficulty: 'Medium', topics: ['Hash Table', 'Linked List'], solved: false },
  { slug: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard', topics: ['Array', 'Two Pointers'], solved: false },
];

function DiffPill({ d }: { d: string }) {
  const style =
    d === 'Easy' ? { background: 'var(--d-easy-bg)', color: 'var(--d-easy)' } :
    d === 'Medium' ? { background: 'var(--d-med-bg)', color: 'var(--d-med)' } :
    { background: 'var(--d-hard-bg)', color: 'var(--d-hard)' };
  return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={style}>{d}</span>;
}

export default async function ProblemsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Try to fetch real problems from DB, fall back to mock
  const { data: dbProblems } = await supabase
    .from('problems')
    .select('slug, title, difficulty, topics')
    .order('created_at', { ascending: true });

  const problems = (dbProblems && dbProblems.length > 0)
    ? dbProblems.map((p: { slug: string; title: string; difficulty: string; topics: string[] }) => ({ ...p, solved: false }))
    : MOCK_PROBLEMS;

  return (
    <Shell>
      <div className="max-w-[860px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold mb-1" style={{ color: 'var(--d-ink)' }}>Problems</h1>
          <p className="text-[14px]" style={{ color: 'var(--d-muted)' }}>Choose a problem and pick your difficulty level.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5">
          {['All', 'Easy', 'Medium', 'Hard'].map(f => (
            <button key={f} className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all"
              style={f === 'All'
                ? { background: 'var(--d-ink)', color: 'var(--d-panel)' }
                : { background: 'var(--d-panel)', color: 'var(--d-muted)', boxShadow: 'var(--d-shadow)' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Problems Table */}
        <div className="rounded-[22px] overflow-hidden" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
          {/* Table Head */}
          <div className="grid grid-cols-[40px_1fr_auto_auto_auto] gap-4 px-5 py-3 text-[12px] font-semibold uppercase tracking-wide"
            style={{ borderBottom: '1px solid var(--d-line)', color: 'var(--d-muted)' }}>
            <span>#</span>
            <span>Title</span>
            <span>Difficulty</span>
            <span>Topics</span>
            <span></span>
          </div>

          {problems.map((p, i) => (
            <div key={p.slug}
              className="grid grid-cols-[40px_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-[var(--d-lime-soft)] transition-colors group"
              style={{ borderBottom: i < problems.length - 1 ? '1px solid var(--d-line)' : 'none' }}>
              <span className="text-[13px]" style={{ color: 'var(--d-muted)' }}>{i + 1}</span>
              <div>
                <p className="font-semibold text-[14px]" style={{ color: 'var(--d-ink)' }}>{p.title}</p>
              </div>
              <DiffPill d={p.difficulty} />
              <div className="hidden md:flex gap-1 flex-wrap">
                {(p.topics || []).slice(0, 2).map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-[11px]"
                    style={{ background: '#D7E6FB', color: '#2F5FA8' }}>{t}</span>
                ))}
              </div>
              <Link href={`/problems/${p.slug}`}
                className="flex items-center gap-1 text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full"
                style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                Solve <ChevronRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
