'use client';

import { useState, useEffect } from 'react';
import { Brain, Plus, X, Sparkles, Loader2, ChevronRight, Code2, Clock, Zap, RotateCcw } from 'lucide-react';
import Shell from '@/components/shell';
import Link from 'next/link';

const TOPIC_SUGGESTIONS = [
  'Arrays', 'Strings', 'Hash Maps', 'Recursion', 'Dynamic Programming',
  'Sorting', 'Binary Search', 'Two Pointers', 'Sliding Window', 'Linked Lists',
  'Stacks', 'Queues', 'Trees', 'Graphs', 'Backtracking', 'For Loops', 'While Loops',
];

interface GeneratedProblem {
  id?: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  test_cases: { input: string; expected_output: string }[];
  reference_solution: string;
}

interface StoredProblem {
  id: string;
  title: string;
  description: string; // JSON string
  created_at: string;
}

function DiffPill({ d }: { d: string }) {
  const style =
    d === 'Easy' ? { background: 'var(--d-easy-bg)', color: 'var(--d-easy)' } :
    d === 'Medium' ? { background: 'var(--d-med-bg)', color: 'var(--d-med)' } :
    { background: 'var(--d-hard-bg)', color: 'var(--d-hard)' };
  return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={style}>{d}</span>;
}

function QuotaBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--d-line)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: used >= limit ? 'var(--d-hard)' : 'var(--d-lime)' }} />
      </div>
      <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: used >= limit ? 'var(--d-hard)' : 'var(--d-muted)' }}>
        {used}/{limit} today
      </span>
    </div>
  );
}

export default function PracticePage() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'mixed'>('mixed');
  const [count, setCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProblems, setGeneratedProblems] = useState<GeneratedProblem[]>([]);
  const [savedProblems, setSavedProblems] = useState<StoredProblem[]>([]);
  const [quota, setQuota] = useState({ used: 0, limit: 5 });
  const [error, setError] = useState<string | null>(null);
  const [expandedProblem, setExpandedProblem] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    const res = await fetch('/api/practice');
    const data = await res.json();
    if (res.ok) {
      setSavedProblems(data.problems || []);
      setQuota(data.quota || { used: 0, limit: 5 });
    }
  };

  const addTopic = (topic: string) => {
    const t = topic.trim();
    if (t && !selectedTopics.includes(t)) {
      setSelectedTopics(prev => [...prev, t]);
    }
    setCustomTopic('');
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics(prev => prev.filter(t => t !== topic));
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) { setError('Please add at least one topic.'); return; }
    if (quota.used >= quota.limit) { setError('Daily quota reached. Try again tomorrow.'); return; }

    setIsGenerating(true);
    setError(null);
    setGeneratedProblems([]);
    setExpandedProblem(null);

    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: selectedTopics, difficulty, count }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedProblems(data.problems || []);
        setQuota(data.quota || quota);
        fetchSaved();
      } else {
        setError(data.error || 'Generation failed.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to connect to AI. Please try again.');
    }
    setIsGenerating(false);
  };

  return (
    <Shell>
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold mb-1" style={{ color: 'var(--d-ink)' }}>AI Topic Practice</h1>
            <p className="text-[14px]" style={{ color: 'var(--d-muted)' }}>Enter topics you want to practice. AI generates a custom problem set just for you.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--d-muted)' }}>DAILY GENERATIONS</p>
              <div className="w-40">
                <QuotaBar used={quota.used} limit={quota.limit} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-full w-fit" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
          {(['generate', 'saved'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-full text-[13px] font-medium capitalize transition-all"
              style={activeTab === tab
                ? { background: 'var(--d-ink)', color: 'var(--d-panel)', fontWeight: 700 }
                : { color: 'var(--d-muted)' }}>
              {tab === 'generate' ? '✦ Generate' : `Saved (${savedProblems.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Config Panel */}
            <div className="flex flex-col gap-4">
              {/* Topic Selector */}
              <div className="p-5 rounded-[22px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                <h2 className="font-bold text-[15px] mb-3 flex items-center gap-2" style={{ color: 'var(--d-ink)' }}>
                  <Brain size={15} style={{ color: 'var(--d-lime)' }} /> Topics
                </h2>

                {/* Selected Topics */}
                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTopics.map(t => (
                      <span key={t} className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-semibold"
                        style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                        {t}
                        <button onClick={() => removeTopic(t)} className="hover:opacity-60 transition-opacity ml-0.5">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTopic(customTopic); } }}
                    placeholder="Type a topic and press Enter..."
                    className="flex-1 px-3 py-2 rounded-full text-[13px] outline-none"
                    style={{ background: 'var(--d-card)', border: '1.5px solid var(--d-line)', color: 'var(--d-ink)' }}
                  />
                  <button onClick={() => addTopic(customTopic)} disabled={!customTopic.trim()}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                    <Plus size={14} />
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {TOPIC_SUGGESTIONS.filter(t => !selectedTopics.includes(t)).slice(0, 10).map(t => (
                    <button key={t} onClick={() => addTopic(t)}
                      className="px-3 py-1 rounded-full text-[11px] font-medium transition-all hover:bg-[var(--d-lime-soft)]"
                      style={{ background: 'var(--d-card)', border: '1px solid var(--d-line)', color: 'var(--d-muted)' }}>
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="p-5 rounded-[22px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                <h2 className="font-bold text-[15px] mb-4" style={{ color: 'var(--d-ink)' }}>Settings</h2>

                <div className="mb-4">
                  <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--d-muted)' }}>DIFFICULTY</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['mixed', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className="px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                        style={difficulty === d
                          ? { background: 'var(--d-ink)', color: 'var(--d-panel)' }
                          : { background: 'var(--d-card)', border: '1px solid var(--d-line)', color: 'var(--d-muted)' }}>
                        {d === 'mixed' ? '🎲 Mixed' : d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--d-muted)' }}>NUMBER OF PROBLEMS</p>
                  <div className="flex gap-2">
                    {[2, 3, 5].map(n => (
                      <button key={n} onClick={() => setCount(n)}
                        className="w-12 h-10 rounded-[10px] text-[13px] font-bold transition-all"
                        style={count === n
                          ? { background: 'var(--d-lime)', color: 'var(--d-ink)' }
                          : { background: 'var(--d-card)', border: '1px solid var(--d-line)', color: 'var(--d-muted)' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              {error && (
                <div className="px-4 py-3 rounded-[12px] text-[13px]"
                  style={{ background: 'var(--d-hard-bg)', color: 'var(--d-hard)' }}>
                  {error}
                </div>
              )}
              <button onClick={handleGenerate}
                disabled={isGenerating || selectedTopics.length === 0 || quota.used >= quota.limit}
                className="flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-bold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--d-ink)', color: 'var(--d-panel)' }}>
                {isGenerating
                  ? <><Loader2 size={18} className="animate-spin" /> Generating problems...</>
                  : <><Sparkles size={18} /> Generate {count} Problems</>}
              </button>
            </div>

            {/* Results Panel */}
            <div>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-[22px] gap-4"
                  style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
                      style={{ borderColor: 'var(--d-lime) transparent var(--d-lime) var(--d-lime)' }} />
                    <Brain size={24} className="absolute inset-0 m-auto" style={{ color: 'var(--d-ink)' }} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[15px]" style={{ color: 'var(--d-ink)' }}>AI is crafting your problems</p>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--d-muted)' }}>
                      Generating {count} {difficulty === 'mixed' ? 'mixed difficulty' : difficulty} problems on{' '}
                      {selectedTopics.slice(0, 2).join(', ')}{selectedTopics.length > 2 ? '...' : ''}
                    </p>
                  </div>
                </div>
              ) : generatedProblems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-[22px] text-center opacity-50"
                  style={{ border: '2px dashed var(--d-line)' }}>
                  <Zap size={36} className="mb-3" style={{ color: 'var(--d-muted)' }} />
                  <p className="font-semibold text-[14px]" style={{ color: 'var(--d-ink)' }}>Your problems will appear here</p>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--d-muted)' }}>Pick topics and hit Generate</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-[14px]" style={{ color: 'var(--d-ink)' }}>
                      {generatedProblems.length} problems generated ✦
                    </p>
                    <button onClick={handleGenerate}
                      className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-70"
                      style={{ color: 'var(--d-muted)' }}>
                      <RotateCcw size={12} /> Regenerate
                    </button>
                  </div>
                  {generatedProblems.map((p, i) => (
                    <div key={i} className="rounded-[18px] overflow-hidden transition-all"
                      style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                      {/* Problem Header */}
                      <button
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--d-lime-soft)] transition-colors"
                        onClick={() => setExpandedProblem(expandedProblem === i ? null : i)}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[12px] font-bold"
                            style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>{i + 1}</div>
                          <div>
                            <p className="font-bold text-[14px]" style={{ color: 'var(--d-ink)' }}>{p.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <DiffPill d={p.difficulty} />
                              {p.topics?.slice(0, 2).map(t => (
                                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full"
                                  style={{ background: '#D7E6FB', color: '#2F5FA8' }}>{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${expandedProblem === i ? 'rotate-90' : ''}`}
                          style={{ color: 'var(--d-muted)' }} />
                      </button>

                      {/* Expanded Problem Body */}
                      {expandedProblem === i && (
                        <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--d-line)' }}>
                          <p className="text-[13px] leading-relaxed mt-4 mb-4" style={{ color: 'var(--d-ink)' }}>{p.description}</p>

                          {p.examples?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-[11px] font-bold uppercase mb-2" style={{ color: 'var(--d-muted)' }}>Examples</p>
                              {p.examples.slice(0, 2).map((ex, ei) => (
                                <div key={ei} className="mb-2 p-3 rounded-[10px] text-[12px] font-mono"
                                  style={{ background: 'var(--d-card)' }}>
                                  <p><span style={{ color: 'var(--d-muted)' }}>Input:</span> {ex.input}</p>
                                  <p><span style={{ color: 'var(--d-muted)' }}>Output:</span> {ex.output}</p>
                                  {ex.explanation && <p className="mt-1" style={{ color: 'var(--d-muted)' }}>{ex.explanation}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {p.constraints?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-[11px] font-bold uppercase mb-2" style={{ color: 'var(--d-muted)' }}>Constraints</p>
                              <ul className="space-y-1">
                                {p.constraints.map((c, ci) => (
                                  <li key={ci} className="text-[12px] font-mono flex items-start gap-2" style={{ color: 'var(--d-ink)' }}>
                                    <span style={{ color: 'var(--d-lime)' }}>•</span> {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            <Link href={`/problems/two-sum`}
                              className="flex items-center gap-1 px-4 py-2 rounded-full text-[12px] font-bold transition-all hover:opacity-90"
                              style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                              <Code2 size={13} /> Solve in Editor
                            </Link>
                            <span className="flex items-center gap-1 px-3 py-2 text-[11px] rounded-full"
                              style={{ background: 'var(--d-card)', color: 'var(--d-muted)' }}>
                              <Clock size={11} /> {p.test_cases?.length || 0} test cases
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Problems Tab */}
        {activeTab === 'saved' && (
          <div>
            {savedProblems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 text-center rounded-[22px] opacity-50"
                style={{ border: '2px dashed var(--d-line)' }}>
                <Brain size={36} className="mb-3" style={{ color: 'var(--d-muted)' }} />
                <p className="font-semibold text-[14px]" style={{ color: 'var(--d-ink)' }}>No saved problems yet</p>
                <p className="text-[13px] mt-1" style={{ color: 'var(--d-muted)' }}>Generate your first practice set!</p>
              </div>
            ) : (
              <div className="rounded-[22px] overflow-hidden" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                {savedProblems.map((p, i) => {
                  let parsed: { difficulty?: string; topics?: string[] } = {};
                  try { parsed = JSON.parse(p.description); } catch { /* ignore */ }
                  return (
                    <div key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-[var(--d-lime-soft)] transition-colors"
                      style={{ borderBottom: i < savedProblems.length - 1 ? '1px solid var(--d-line)' : 'none' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                          style={{ background: 'var(--d-lime-soft)' }}>
                          <Brain size={15} style={{ color: 'var(--d-ink)' }} />
                        </div>
                        <div>
                          <p className="font-semibold text-[14px]" style={{ color: 'var(--d-ink)' }}>{p.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {parsed.difficulty && <DiffPill d={parsed.difficulty} />}
                            <span className="text-[11px]" style={{ color: 'var(--d-muted)' }}>
                              {new Date(p.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href="/problems/two-sum"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all hover:opacity-90"
                        style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
                        Solve <ChevronRight size={12} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
