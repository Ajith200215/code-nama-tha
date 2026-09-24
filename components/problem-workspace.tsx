/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CircleAlert, CheckCircle2, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function ProblemWorkspace({ problem, testCases, levels, isCustom = false }: any) {
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
    const newLevelData = levels.find((l: any) => l.level === lvl && l.language === language);
    if (newLevelData) {
      if (code !== currentLevelData.template_code && code.trim() !== '') {
        if (!window.confirm("Changing levels will reset your code to this level's template. Are you sure?")) {
          return;
        }
      }
      setCode(newLevelData.template_code);
    }
    setActiveLevel(lvl);
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
          problem_id: (!isCustom && problem.id !== 'mock-uuid') ? problem.id : undefined,
          testCases: (isCustom || problem.id === 'mock-uuid') ? testCases : undefined,
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
    <div className="flex-1 flex flex-col md:flex-row h-full w-full gap-3 p-3 pt-0" style={{ background: 'var(--d-page)' }}>
      
      {/* Left Pane: Problem Description */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full rounded-[22px] overflow-hidden relative"
        style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--d-line)' }}>
          <Link href="/problems" className="flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--d-muted)' }}>
            <span className="text-[16px]">←</span> Back
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{
              background: problem.difficulty === 'Easy' ? '#E9F99D' : problem.difficulty === 'Medium' ? '#FFE8A1' : '#FFD6D6',
              color: problem.difficulty === 'Easy' ? '#1A1D1A' : problem.difficulty === 'Medium' ? '#996500' : '#CC0000'
            }}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <h1 className="text-[22px] font-bold mb-4" style={{ color: 'var(--d-ink)' }}>{problem.title}</h1>
          <div className="text-[14px] leading-relaxed max-w-none prose prose-invert prose-p:mb-3" style={{ color: 'var(--d-muted)' }}>
            <ReactMarkdown components={{
              p: ({node, ...props}) => <p className="mb-3" {...props} />,
              strong: ({node, ...props}) => <strong style={{ color: 'var(--d-ink)' }} {...props} />
            }}>
              {problem.description}
            </ReactMarkdown>
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--d-line)' }}>
            <h3 className="font-bold text-[13px] mb-4" style={{ color: 'var(--d-ink)' }}>Level {activeLevel} Hints</h3>
            {currentLevelData.hints.length > 0 ? (
              <ul className="space-y-3">
                {currentLevelData.hints.map((hint: string, i: number) => (
                  <li key={i} className="p-4 rounded-[14px] text-[13px] leading-relaxed flex items-start gap-2"
                    style={{ background: 'var(--d-card)', color: 'var(--d-ink)' }}>
                    <span style={{ color: 'var(--d-lime)' }}>💡</span>{hint}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 rounded-[14px] text-[13px] italic" style={{ background: 'var(--d-card)', color: 'var(--d-muted)' }}>
                No hints available for Level 0. You are on your own!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane: Editor & Console */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col h-full rounded-[22px] overflow-hidden relative"
        style={{ background: 'var(--d-ink)', boxShadow: 'var(--d-shadow)' }}>
        
        {/* Editor Toolbar */}
        <div className="h-14 flex items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-4">
            <div className="font-mono text-[11px] px-2 py-1 rounded-[6px]"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              {language}
            </div>
            <div className="flex rounded-[8px] p-1 gap-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {[3, 2, 1, 0].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={cn(
                    "px-3 py-1 font-mono text-[11px] rounded-[6px] transition-colors font-bold",
                    activeLevel === lvl 
                      ? "text-black" 
                      : "text-white/40 hover:text-white"
                  )}
                  style={activeLevel === lvl ? { background: 'var(--d-lime)' } : {}}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all disabled:opacity-50"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            >
              <Sparkles size={13} style={{ color: 'var(--d-lime)' }} />
              Get AI Review
            </button>
            <button 
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}
            >
              {isRunning ? (
                <span className="w-3.5 h-3.5 border-2 border-[var(--d-ink)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={13} className="fill-[var(--d-ink)]" />
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="w-full max-w-2xl rounded-[22px] flex flex-col max-h-full" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
                <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--d-line)' }}>
                  <div className="flex items-center gap-2 font-bold text-[15px]" style={{ color: 'var(--d-ink)' }}>
                    <Sparkles style={{ color: 'var(--d-lime)' }} size={18} /> AI Code Review
                  </div>
                  <button onClick={() => setShowReviewModal(false)} className="transition-opacity hover:opacity-70" style={{ color: 'var(--d-muted)' }}>
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto text-[14px] leading-relaxed" style={{ color: 'var(--d-ink)' }}>
                  {isReviewing ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Sparkles className="animate-pulse" style={{ color: 'var(--d-lime)' }} size={32} />
                      <p className="font-semibold text-[13px]" style={{ color: 'var(--d-muted)' }}>Analyzing complexity and style...</p>
                    </div>
                  ) : (
                    <div className="prose prose-p:text-[14px] max-w-none" style={{ color: 'var(--d-ink)' }}>
                      <ReactMarkdown components={{
                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                        strong: ({node, ...props}) => <strong style={{ color: 'var(--d-ink)' }} {...props} />
                      }}>
                        {reviewText || ''}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Console / Test Results */}
        <div className="h-[35%] flex flex-col" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="h-10 flex items-center px-5 font-bold text-[12px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            Console
          </div>
          <div className="flex-1 overflow-y-auto p-5 font-mono text-[13px]" style={{ color: 'white' }}>
            {!results ? (
              <div style={{ color: 'rgba(255,255,255,0.4)' }}>Run your code to see test results here...</div>
            ) : (
              <div className="flex flex-col gap-4">
                {results.map((res, idx) => (
                  <div key={idx} className="rounded-[14px] p-4" style={{ 
                    background: res.passed ? 'rgba(210, 243, 76, 0.05)' : 'rgba(255, 92, 92, 0.05)',
                    border: `1px solid ${res.passed ? 'rgba(210, 243, 76, 0.2)' : 'rgba(255, 92, 92, 0.2)'}`
                  }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-bold" style={{ color: res.passed ? 'var(--d-lime)' : '#FF5C5C' }}>
                        {res.passed ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
                        Test Case {idx + 1} {testCases[idx]?.is_hidden ? '(Hidden)' : ''}: {res.status}
                      </div>
                    </div>
                    {(!testCases[idx]?.is_hidden || res.passed) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1 opacity-80">
                        <div>
                          <div className="text-[10px] font-bold uppercase mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Input</div>
                          <div className="p-2 rounded-[8px] text-[12px]" style={{ background: 'rgba(255,255,255,0.05)' }}>{res.input || testCases[idx]?.input}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Expected</div>
                          <div className="p-2 rounded-[8px] text-[12px]" style={{ background: 'rgba(255,255,255,0.05)' }}>{res.expected}</div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <div className="text-[10px] font-bold uppercase mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Actual Output</div>
                      <div className="p-2 rounded-[8px] text-[12px] min-h-[32px]" style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        color: res.passed ? 'white' : '#FF5C5C' 
                      }}>
                        {res.output || <span style={{ color: 'rgba(255,255,255,0.3)' }}>No output</span>}
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
