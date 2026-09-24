'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';

export default function ExplainPage() {
  const [code, setCode] = useState('def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const handleExplain = async () => {
    if (!code.trim()) return;
    setIsExplaining(true);
    setExplanation(null);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (res.ok) {
        setExplanation(data.explanation);
      } else {
        setExplanation("Error: " + (data.error || "Failed to explain code."));
      }
    } catch (err: unknown) {
      console.error(err);
      setExplanation("Error: Failed to connect to explanation engine.");
    }
    setIsExplaining(false);
  };

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      {/* Navbar */}
      <nav className="h-[72px] flex items-center justify-between px-[clamp(24px,6vw,92px)] border-b border-[var(--border)] bg-[var(--surface-2)]">
        <Link href="/" className="font-mono text-lg font-bold">CodeArena¬</Link>
        <div className="flex gap-6 font-mono text-[13px]">
          <Link href="/problems" className="text-[var(--text-muted)] hover:text-[var(--text)]">Problems</Link>
          <span className="text-[var(--accent)]">[ Explain ]</span>
        </div>
      </nav>

      <div className="flex-1 max-w-[1280px] w-full mx-auto px-[clamp(24px,6vw,92px)] py-12 flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Input */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Code Explainer</h1>
            <p className="text-[var(--text-muted)]">Paste any confusing code snippet. We&apos;ll break it down line-by-line using simple analogies.</p>
          </div>
          
          <div className="flex-1 min-h-[400px] border border-[var(--border)] rounded-[8px] overflow-hidden bg-[#0a0a0a] shadow-[0_0_30px_var(--accent-glow)] flex flex-col">
            <div className="h-10 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center px-4 font-mono text-[12px] text-[var(--text-muted)]">
              Input Code
            </div>
            <div className="flex-1 relative">
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>

          <button
            onClick={handleExplain}
            disabled={isExplaining || !code.trim()}
            className="self-end flex items-center gap-2 bg-[var(--accent-strong)] hover:bg-[var(--accent)] text-black px-6 py-3 rounded-[6px] font-mono text-[14px] font-medium transition-all disabled:opacity-50"
          >
            {isExplaining ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Explain Code
          </button>
        </div>

        {/* Right Side: Output */}
        <div className="flex-1 flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {!explanation && !isExplaining ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Sparkles size={48} className="text-[var(--accent)] mb-4" />
              <p className="font-mono text-sm max-w-[30ch]">Ready to decipher the matrix. Paste your code and hit Explain.</p>
            </div>
          ) : isExplaining ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Loader2 size={48} className="text-[var(--accent)] animate-spin mb-4" />
              <p className="font-mono text-sm text-[var(--text-muted)]">Analyzing logic and crafting analogies...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-p:text-[var(--text-muted)] prose-strong:text-white prose-pre:bg-[var(--surface-2)] prose-pre:border prose-pre:border-[var(--border)] prose-a:text-[var(--accent)] max-w-none">
              {explanation?.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-4">{line.slice(2)}</h2>;
                if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold mt-5 mb-3">{line.slice(3)}</h3>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="mb-2">{line}</p>;
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
