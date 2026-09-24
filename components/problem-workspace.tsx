/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CircleAlert, CheckCircle2, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProblemWorkspace({ problem, testCases, levels }: any) {
  const [activeLevel, setActiveLevel] = useState(3);
  const language = 'python'; // Hardcoded language
  
  const currentLevelData = levels.find((l: any) => l.level === activeLevel && l.language === language) || levels[0];
  const [code, setCode] = useState(currentLevelData.template_code);
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewText, setReviewText] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleLevelChange = (lvl: number) => {
    setActiveLevel(lvl);
    const newLevelData = levels.find((l: any) => l.level === lvl && l.language === language);
    if (newLevelData) {
      setCode(newLevelData.template_code);
    }
    setResults(null);
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problem_id: problem.id !== 'mock-uuid' ? problem.id : undefined,
          testCases: problem.id === 'mock-uuid' ? testCases : undefined,
        })
      });
      const data = await res.json();
      setResults(data.results);
      if (data.allPassed) {
        alert("🎉 All test cases passed! Level complete.");
      }
    } catch (e) {
      console.error(e);
      setResults([{ passed: false, status: 'Error', output: 'Failed to connect to execution engine.' }]);
    }
    setIsRunning(false);
  };

  const getReview = async () => {
    setIsReviewing(true);
    setShowReviewModal(true);
    setReviewText(null);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problem_title: problem.title,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewText(data.review);
      } else {
        setReviewText("Error: " + (data.error || "Failed to get review."));
      }
    } catch (e) {
      console.error(e);
      setReviewText("Failed to connect to review engine.");
    }
    setIsReviewing(false);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      
      {/* Left Pane: Problem Description */}
      <div className="w-full md:w-[40%] flex flex-col border-r border-[var(--border)] bg-[var(--surface)] h-full overflow-y-auto">
        
        {/* Header */}
        <div className="h-14 border-b border-[var(--border)] flex items-center px-4 justify-between bg-[var(--surface-2)]">
          <Link href="/problems" className="font-mono text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            <span className={cn("text-[12px] font-mono", 
              problem.difficulty === 'Easy' ? 'text-[var(--success)]' : 
              problem.difficulty === 'Medium' ? 'text-[var(--warn)]' : 'text-[var(--danger)]'
            )}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <h1 className="text-2xl font-mono font-bold mb-4">{problem.title}</h1>
          <div className="prose prose-invert prose-p:text-sm prose-p:text-[var(--text-muted)] prose-pre:bg-[var(--surface-2)] prose-pre:border prose-pre:border-[var(--border)] max-w-none">
            {problem.description.split('\n').map((line: string, i: number) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>

          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <h3 className="font-mono text-sm mb-4">Level {activeLevel} Hints</h3>
            {currentLevelData.hints.length > 0 ? (
              <ul className="space-y-3">
                {currentLevelData.hints.map((hint: string, i: number) => (
                  <li key={i} className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded text-sm text-[var(--text-muted)]">
                    <span className="text-[var(--accent)] mr-2">💡</span>{hint}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-sm text-[var(--text-muted)] italic">No hints available for Level 0. You are on your own!</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane: Editor & Console */}
      <div className="w-full md:w-[60%] flex flex-col h-full bg-[#0a0a0a]">
        
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-[var(--border)] flex items-center justify-between px-4 bg-[var(--surface)]">
          <div className="flex items-center gap-4">
            <div className="font-mono text-[12px] text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-1 rounded">
              {language}
            </div>
            <div className="flex bg-[var(--surface-2)] rounded-[6px] p-1 gap-1">
              {[3, 2, 1, 0].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={cn(
                    "px-3 py-1 font-mono text-[12px] rounded-[4px] transition-colors",
                    activeLevel === lvl 
                      ? "bg-[var(--accent)] text-black font-semibold shadow-[0_0_10px_var(--accent-glow)]" 
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  )}
                >
                  L{lvl}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={getReview}
              disabled={isReviewing}
              className="flex items-center gap-2 bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text)] px-4 py-1.5 rounded-[6px] font-mono text-[13px] font-medium transition-all disabled:opacity-50"
            >
              <Sparkles size={14} className="text-[var(--accent)]" />
              Get AI Review
            </button>
            <button 
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 bg-[var(--accent-strong)] hover:bg-[var(--accent)] text-black px-4 py-1.5 rounded-[6px] font-mono text-[13px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow)] disabled:opacity-50"
            >
              {isRunning ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={14} className="fill-black" />
              )}
              Run Code
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 relative overflow-hidden">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              roundedSelection: false,
              wordWrap: 'on'
            }}
          />
          
          {/* AI Review Modal */}
          {showReviewModal && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-[8px] shadow-[0_0_40px_var(--accent-glow)] flex flex-col max-h-full">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2 font-mono font-bold text-lg">
                    <Sparkles className="text-[var(--accent)]" /> AI Code Review
                  </div>
                  <button onClick={() => setShowReviewModal(false)} className="text-[var(--text-muted)] hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  {isReviewing ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Sparkles className="text-[var(--accent)] animate-pulse" size={32} />
                      <p className="font-mono text-[var(--text-muted)]">Analyzing complexity and style...</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-p:text-[var(--text-muted)] prose-strong:text-white max-w-none">
                      {reviewText?.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Console / Test Results */}
        <div className="h-[30%] border-t border-[var(--border)] bg-[var(--surface)] flex flex-col">
          <div className="h-8 border-b border-[var(--border)] flex items-center px-4 font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
            Console
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {!results ? (
              <div className="text-[var(--text-muted)] italic">Run your code to see test results here...</div>
            ) : (
              <div className="flex flex-col gap-4">
                {results.map((res, idx) => (
                  <div key={idx} className={cn(
                    "border rounded-[6px] p-3",
                    res.passed ? "border-[var(--success)] bg-[var(--success)]/5" : "border-[var(--danger)] bg-[var(--danger)]/5"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn("flex items-center gap-2 text-[13px] font-semibold", res.passed ? "text-[var(--success)]" : "text-[var(--danger)]")}>
                        {res.passed ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
                        Test Case {idx + 1} {testCases[idx]?.is_hidden ? '(Hidden)' : ''}: {res.status}
                      </div>
                    </div>
                    {(!testCases[idx]?.is_hidden || res.passed) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 opacity-80">
                        <div>
                          <div className="text-[11px] text-[var(--text-muted)] mb-1">Input</div>
                          <div className="bg-black/50 p-2 rounded text-[12px]">{res.input || testCases[idx]?.input}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[var(--text-muted)] mb-1">Expected</div>
                          <div className="bg-black/50 p-2 rounded text-[12px]">{res.expected}</div>
                        </div>
                      </div>
                    )}
                    <div className="mt-3">
                      <div className="text-[11px] text-[var(--text-muted)] mb-1">Actual Output</div>
                      <div className={cn("bg-black/50 p-2 rounded text-[12px] min-h-[32px]", !res.passed && "text-[var(--danger)]")}>
                        {res.output || <span className="text-[var(--text-muted)] italic">No output</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
