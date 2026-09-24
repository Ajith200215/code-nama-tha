'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Shell from '@/components/shell';

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
      setExplanation(res.ok ? data.explanation : "Error: " + (data.error || "Failed to explain code."));
    } catch (err: unknown) {
      console.error(err);
      setExplanation("Error: Failed to connect to explanation engine.");
    }
    setIsExplaining(false);
  };

  return (
    <Shell>
      <div className="flex flex-col md:flex-row gap-4" style={{ height: 'calc(100vh - 88px)' }}>
        {/* Left: Input */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h1 className="text-[24px] font-bold mb-1" style={{ color: 'var(--d-ink)' }}>Code Explainer</h1>
            <p className="text-[13px]" style={{ color: 'var(--d-muted)' }}>Paste any confusing code. We&apos;ll break it down with simple analogies.</p>
          </div>

          <div className="flex-1 rounded-[22px] overflow-hidden min-h-[300px]" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
            <div className="h-10 flex items-center px-4 text-[12px] font-semibold" style={{ borderBottom: '1px solid var(--d-line)', color: 'var(--d-muted)' }}>
              Input Code
            </div>
            <div style={{ height: 'calc(100% - 40px)' }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-light"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', padding: { top: 16 }, scrollBeyondLastLine: false }}
              />
            </div>
          </div>

          <button onClick={handleExplain} disabled={isExplaining || !code.trim()}
            className="self-end flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--d-lime)', color: 'var(--d-ink)' }}>
            {isExplaining ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Explain Code
          </button>
        </div>

        {/* Right: Output */}
        <div className="flex-1 rounded-[22px] p-6 overflow-y-auto" style={{ background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)' }}>
          {!explanation && !isExplaining ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Sparkles size={40} className="mb-4" style={{ color: 'var(--d-ink)' }} />
              <p className="text-[13px]" style={{ color: 'var(--d-muted)' }}>Paste code and hit Explain</p>
            </div>
          ) : isExplaining ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Loader2 size={40} className="animate-spin mb-4" style={{ color: 'var(--d-lime)' }} />
              <p className="text-[13px]" style={{ color: 'var(--d-muted)' }}>Analyzing code and crafting analogies...</p>
            </div>
          ) : (
            <div style={{ color: 'var(--d-ink)' }} className="
              [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[var(--d-line)]
              [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
              [&_p]:mb-3 [&_p]:text-[13px] [&_p]:leading-relaxed
              [&_ul]:mb-3 [&_ul]:ml-5 [&_ul]:list-disc
              [&_ol]:mb-3 [&_ol]:ml-5 [&_ol]:list-decimal
              [&_li]:mb-1 [&_li]:text-[13px] [&_li]:leading-relaxed
              [&_strong]:font-bold
              [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px] [&_code]:font-mono [&_code]:bg-[var(--d-lime-soft)]
              [&_pre]:rounded-[12px] [&_pre]:p-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:text-[13px] [&_pre]:bg-[var(--d-card)]
              [&_pre_code]:p-0 [&_pre_code]:bg-transparent
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation ?? ''}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
