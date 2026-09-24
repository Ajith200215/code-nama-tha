'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
            <div className="
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-0 [&_h1]:mb-3 [&_h1]:text-white
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-white [&_h2]:border-b [&_h2]:border-[var(--border)] [&_h2]:pb-2
              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-[var(--accent)]
              [&_p]:mb-3 [&_p]:text-[var(--text-muted)] [&_p]:leading-relaxed [&_p]:text-[14px]
              [&_ul]:mb-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:text-[var(--text-muted)]
              [&_ol]:mb-3 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:text-[var(--text-muted)]
              [&_li]:mb-1 [&_li]:leading-relaxed [&_li]:text-[14px]
              [&_strong]:text-white [&_strong]:font-semibold
              [&_em]:text-[var(--accent)] [&_em]:italic
              [&_code]:bg-[var(--surface-2)] [&_code]:text-[var(--accent)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[12px]
              [&_pre]:bg-[#0a0a0a] [&_pre]:border [&_pre]:border-[var(--border)] [&_pre]:rounded-[6px] [&_pre]:p-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto
              [&_pre_code]:bg-transparent [&_pre_code]:text-[#e2e8f0] [&_pre_code]:p-0 [&_pre_code]:text-[13px]
              [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--accent)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--text-muted)] [&_blockquote]:my-3
              [&_hr]:border-[var(--border)] [&_hr]:my-4
              [&_table]:w-full [&_table]:mb-4 [&_table]:border-collapse [&_table]:text-[13px]
              [&_thead]:bg-[var(--surface-2)]
              [&_th]:border [&_th]:border-[var(--border)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-white
              [&_td]:border [&_td]:border-[var(--border)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-[var(--text-muted)] [&_td]:align-top
              [&_tr:nth-child(even)]:bg-[rgba(255,255,255,0.02)]
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation ?? ''}</ReactMarkdown>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
