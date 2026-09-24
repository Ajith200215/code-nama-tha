"use client";

import { motion } from "motion/react";
import { AuroraBars } from "@/components/ui/aurora-bars";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

// Platform Name Placeholder
const PLATFORM_NAME = "CodeArena";

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="relative min-h-dvh bg-[var(--bg)] text-[var(--text)] overflow-x-hidden selection:bg-[var(--accent)] selection:text-black">
      
      {/* 1. Aurora Background Layer (z-0) */}
      <AuroraBars
        barCount={isMobile ? 24 : 60}
        colors={["#ff5aa6", "#ff2d78", "#9c1650", "#2a0616", "#00000000"]}
        maxHeightRatio={0.85}
        minHeightRatio={0.14}
        speed={3}
        gap={0}
        blur={0}
        background="#000000"
        className={cn("absolute inset-x-0 bottom-0 z-0", isMobile ? "h-[50vh]" : "h-[70vh]")}
      />

      {/* 2. Left Scrim Layer (z-10) */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, #000 0%, #000000e6 32%, #00000000 70%)"
        }}
      />

      {/* 3. Content Layer (z-20) */}
      <div className="relative z-20 w-full px-[clamp(24px,6vw,92px)] min-h-dvh flex flex-col">
        
        {/* Navbar */}
        <motion.nav 
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="h-[72px] flex items-center justify-between"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--surface)]">
              <div className="w-4 h-4 rounded-full bg-[var(--text)]" />
            </div>
            <span className="font-mono font-semibold text-lg">{PLATFORM_NAME}¬</span>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 font-mono text-[13px]">
            <span className="text-[var(--accent)]">[ Problems ]</span>
            <span className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer">Levels</span>
            <span className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer">Rooms</span>
            <span className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer">Explain</span>
          </div>

          {/* Right CTA */}
          <Link href="/login" className="hidden md:flex">
            <button className="relative px-[22px] py-[12px] font-mono text-[14px] text-[var(--accent)] border border-[var(--accent)] rounded-[8px] hover:bg-[var(--accent-glow)] transition-colors group">
              {/* Notched corners effect simulated */}
              <span className="absolute -top-[1px] -right-[1px] w-2 h-2 bg-[var(--bg)]" />
              <span className="absolute -bottom-[1px] -left-[1px] w-2 h-2 bg-[var(--bg)]" />
              Log — in
            </button>
          </Link>
          
          {/* Mobile Menu Icon */}
          <div className="md:hidden w-6 h-6 flex flex-col justify-center gap-1.5 cursor-pointer">
            <div className="w-full h-[2px] bg-[var(--text)]" />
            <div className="w-full h-[2px] bg-[var(--text)]" />
          </div>
        </motion.nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col md:flex-row items-center pt-[10vh] pb-10">
          
          {/* Left Column (Text) */}
          <div className="w-full md:w-[55%] flex flex-col z-30">
            <h1 className="text-[clamp(3rem,7vw,6rem)] leading-[1.08] tracking-[-0.03em] font-sans">
              <motion.div initial={{ y: 40, filter: "blur(10px)", opacity: 0 }} animate={{ y: 0, filter: "blur(0px)", opacity: 1 }} transition={{ duration: 0.9, delay: 0.5 }}>
                Solve it <span className="text-[var(--accent)]">&lt;your way&gt;</span>
              </motion.div>
              <motion.div initial={{ y: 40, filter: "blur(10px)", opacity: 0 }} animate={{ y: 0, filter: "blur(0px)", opacity: 1 }} transition={{ duration: 0.9, delay: 0.65 }}>
                we guide you
              </motion.div>
              <motion.div initial={{ y: 40, filter: "blur(10px)", opacity: 0 }} animate={{ y: 0, filter: "blur(0px)", opacity: 1 }} transition={{ duration: 0.9, delay: 0.8 }}>
                through the rest.
              </motion.div>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }}
              className="mt-8 text-[17px] leading-[1.6] text-[var(--text-muted)] max-w-[34ch]"
            >
              Guided 4-level practice, AI code review, and rooms to race your friends.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.25 }}
              className="mt-10 flex items-center gap-6"
            >
              <Link href="/signup">
                <motion.button 
                  animate={{ boxShadow: ["0 0 0px var(--accent-glow)", "0 0 24px var(--accent-glow)", "0 0 0px var(--accent-glow)"] }}
                  transition={{ duration: 1.5, delay: 1.9 }}
                  className="bg-[var(--accent-strong)] text-black font-mono font-medium text-[14px] px-6 py-[14px] rounded-[6px] hover:bg-[var(--accent)] hover:shadow-[0_0_24px_var(--accent-glow)] focus-visible:outline-2 focus-visible:outline-[var(--accent-soft)] focus-visible:outline-offset-3 transition-all"
                >
                  Start solving
                </motion.button>
              </Link>
              <Link href="/explain" className="font-mono text-[var(--accent)] text-[14px] hover:text-[var(--accent-soft)] transition-colors">
                Explain any code
              </Link>
            </motion.div>
          </div>

          {/* Right Column (Cards) */}
          <div className="hidden md:flex w-[45%] flex-col items-end justify-center gap-8 pointer-events-none" aria-hidden="true">
            
            {/* Stats Card */}
            <motion.div 
              initial={{ x: 48, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 1.2, ease: "easeOut" }}
              className="w-[276px] h-[140px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] backdrop-blur-[12px] shadow-[0_0_40px_var(--accent-glow)] p-5 flex flex-col justify-between overflow-hidden relative mr-8"
            >
              <div>
                <div className="text-[3rem] leading-none font-sans">8</div>
                <div className="text-[12px] font-mono text-[var(--text-muted)] mt-1">Problems solved today</div>
              </div>
              <div className="flex gap-[4px] mt-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-[8px] h-[24px] bg-[var(--accent)] rounded-[2px]" />
                ))}
                {[...Array(2)].map((_, i) => (
                  <div key={i+8} className="w-[8px] h-[24px] border border-[var(--accent)] rounded-[2px]" />
                ))}
              </div>
              
              {/* Decorative Mesh */}
              <svg className="absolute right-0 top-0 h-full w-[100px] opacity-50" viewBox="0 0 100 140" fill="none">
                <path d="M100 20 L40 60 L100 100 M40 60 L60 120 L100 140" stroke="var(--accent)" strokeWidth="1" />
                <circle cx="40" cy="60" r="2" fill="var(--accent)" />
                <circle cx="100" cy="20" r="2" fill="var(--accent)" />
                <circle cx="100" cy="100" r="2" fill="var(--accent)" />
                <circle cx="60" cy="120" r="2" fill="var(--accent)" />
              </svg>
            </motion.div>

            {/* Problem Panel */}
            <motion.div 
              initial={{ x: 48, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 1.4, ease: "easeOut" }}
              className="w-[344px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] backdrop-blur-[12px] shadow-[0_0_40px_var(--accent-glow)] p-5 flex flex-col z-10"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>
                <span className="font-mono text-[14px]">Arrays / Two Sum</span>
              </div>
              
              <div className="flex gap-6 font-mono text-[12px] mt-6 border-b border-[var(--border)] pb-2 relative">
                <span className="text-[var(--text)]">Levels</span>
                <span className="text-[var(--text-muted)]">Rooms</span>
                <span className="text-[var(--text-muted)]">Review</span>
                <div className="absolute bottom-[-1px] left-0 w-[42px] h-[2px] bg-[var(--accent)]" />
              </div>
              
              <div className="mt-4 flex flex-col gap-2 flex-1">
                <div className="h-[56px] bg-[var(--surface-2)] rounded-[6px] p-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[12px] text-[var(--text)]">Level 3 · guided</div>
                    <div className="font-mono text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--success)]" /> Passed
                    </div>
                  </div>
                  <div className="text-[var(--text-muted)]">⋮</div>
                </div>
                <div className="h-[56px] bg-[var(--surface-2)] rounded-[6px] p-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[12px] text-[var(--text)]">Level 2 · half code</div>
                    <div className="font-mono text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--warn)]" /> In progress
                    </div>
                  </div>
                  <div className="text-[var(--text-muted)]">⋮</div>
                </div>
                <div className="h-[56px] bg-[var(--surface-2)] rounded-[6px] p-3 flex items-center justify-between opacity-60">
                  <div>
                    <div className="font-mono text-[12px] text-[var(--text)]">Level 1 · hints only</div>
                    <div className="font-mono text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" /> Open
                    </div>
                  </div>
                  <div className="text-[var(--text-muted)]">⋮</div>
                </div>
              </div>
            </motion.div>

            {/* Code Card */}
            <motion.div 
              initial={{ x: 48, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 1.6, ease: "easeOut" }}
              className="w-[300px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] backdrop-blur-[12px] shadow-[0_0_40px_var(--accent-glow)] overflow-hidden z-20 self-center mr-12"
            >
              <div className="h-8 border-b border-[var(--border)] flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              </div>
              <div className="p-4 bg-[var(--surface-2)] h-full font-mono text-[12px] leading-[1.6]">
                <div className="text-[var(--text-muted)]"># Level 3: fill the blank</div>
                <div><span className="text-[var(--accent-soft)]">seen</span> = {"{}"}</div>
                <div><span className="text-[var(--accent)]">for</span> i, n <span className="text-[var(--accent)]">in</span> enumerate(nums):</div>
                <div className="pl-4">need = target - n</div>
                <div className="pl-4"><span className="text-[var(--accent)]">if</span> need <span className="text-[var(--accent)]">in</span> seen:</div>
                <div className="pl-8 flex">
                  <span className="text-[var(--accent)]">return</span> [seen[need], i]
                  <motion.div 
                    animate={{ opacity: [1, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 bg-[var(--accent)] ml-1 h-[14px] mt-[3px]"
                  />
                </div>
              </div>
            </motion.div>
            
          </div>
          
          {/* Mobile Only Design Panel (Simplified) */}
          <div className="md:hidden w-full mt-12 flex justify-center z-30 pb-20">
             <div className="w-full max-w-[344px] h-[240px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] backdrop-blur-[12px] shadow-[0_0_40px_var(--accent-glow)] p-5 flex flex-col">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>
                <span className="font-mono text-[14px]">Arrays / Two Sum</span>
              </div>
              <div className="mt-6 flex flex-col gap-2 flex-1">
                <div className="h-[56px] bg-[var(--surface-2)] rounded-[6px] p-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[12px] text-[var(--text)]">Level 3 · guided</div>
                    <div className="font-mono text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--success)]" /> Passed
                    </div>
                  </div>
                </div>
                <div className="h-[56px] bg-[var(--surface-2)] rounded-[6px] p-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[12px] text-[var(--text)]">Level 2 · half code</div>
                    <div className="font-mono text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--warn)]" /> In progress
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Section 11.1: Levels */}
        <div className="py-24 border-t border-[var(--border)] relative z-20">
          <h2 className="text-[2rem] font-sans mb-12">The Four Levels of Mastery</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[ 
              { lvl: 3, title: "Guided", pct: 90, desc: "Fill in the missing line. Perfect for getting unstuck." },
              { lvl: 2, title: "Half Code", pct: 45, desc: "Structure is provided. You write the logic." },
              { lvl: 1, title: "Hints Only", pct: 10, desc: "A blank slate with gentle nudges in the right direction." },
              { lvl: 0, title: "Blank Canvas", pct: 0, desc: "You against the machine. No help, just tests." },
            ].map((l) => (
              <div key={l.lvl} className="bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 flex flex-col">
                <div className="font-mono text-[var(--accent)] mb-2">Level {l.lvl}</div>
                <div className="text-xl font-sans mb-4">{l.title}</div>
                <div className="h-1 w-full bg-[var(--surface-2)] rounded-full mb-4 overflow-hidden border border-[var(--border)]">
                   <motion.div 
                     initial={{ width: 0 }} 
                     whileInView={{ width: `${l.pct}%` }} 
                     viewport={{ once: true }}
                     className="h-full bg-[var(--accent)]" 
                     transition={{ duration: 1, delay: 0.2 }}
                   />
                </div>
                <p className="text-[var(--text-muted)] text-sm">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 11.2: Rooms */}
        <div className="py-24 border-t border-[var(--border)] relative z-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2">
            <h2 className="text-[2rem] font-sans mb-6">Race Your Friends</h2>
            <p className="text-[var(--text-muted)] text-[17px] leading-[1.6] mb-8 max-w-[40ch]">
              Generate a unique room link, invite your peers, and compete in real-time. Leaderboards update instantly as you pass test cases.
            </p>
            <button className="bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[14px] px-6 py-3 rounded-[6px] hover:border-[var(--accent)] transition-colors">
              Create a Room
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-end">
            <div className="w-full max-w-[400px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 shadow-[0_0_40px_var(--accent-glow)]">
              <div className="font-mono text-[14px] mb-6 flex justify-between">
                <span>Room: <span className="text-[var(--accent)]">winter-bash</span></span>
                <span className="text-[var(--text-muted)]">3/5 Players</span>
              </div>
              <div className="space-y-4">
                {[ 
                  { name: "alice_dev", time: "05:12", status: "Passed", icon: "bg-[var(--success)]" },
                  { name: "bob_codes", time: "06:45", status: "Passed", icon: "bg-[var(--success)]" },
                  { name: "you", time: "--:--", status: "In progress", icon: "bg-[var(--warn)]" },
                ].map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-[var(--surface-2)] p-3 rounded-[6px]">
                    <span className="font-mono text-[13px]">{i+1}. {p.name}</span>
                    <div className="flex items-center gap-4 font-mono text-[12px]">
                      <div className="flex items-center gap-1.5">
                         <div className={`w-2 h-2 rounded-full ${p.icon}`} />
                         <span className="text-[var(--text-muted)]">{p.status}</span>
                      </div>
                      <span>{p.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 11.3: Explain */}
        <div className="py-24 border-t border-[var(--border)] relative z-20">
          <h2 className="text-[2rem] font-sans mb-12 text-center">Understand Every Line</h2>
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[8px] p-6 font-mono text-[13px] flex flex-col justify-center">
              <div className="text-[var(--text-muted)] mb-4"># Code Snippet</div>
              <div><span className="text-[var(--accent)]">if</span> need <span className="text-[var(--accent)]">in</span> seen:</div>
              <div className="pl-4"><span className="text-[var(--accent)]">return</span> [seen[need], i]</div>
            </div>
            <div className="flex items-center justify-center text-[var(--accent)] text-xl font-bold font-mono">
              →
            </div>
            <div className="flex-1 bg-[var(--surface)] border border-[var(--accent)] rounded-[8px] p-6 font-mono text-[13px] shadow-[0_0_30px_var(--accent-glow)] flex flex-col justify-center">
              <div className="text-[var(--accent)] mb-4"># AI Explanation</div>
              <p className="text-[var(--text)] mb-2">Check if the complement (`target - current_number`) exists in our hash map.</p>
              <p className="text-[var(--text)]">If it does, we found the pair! Return the stored index and the current index.</p>
            </div>
          </div>
        </div>

        {/* Section 11.4: Footer */}
        <footer className="py-12 border-t border-[var(--border)] relative z-20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--surface)]">
              <div className="w-3 h-3 rounded-full bg-[var(--text)]" />
            </div>
            <span className="font-mono font-semibold text-sm">{PLATFORM_NAME}¬</span>
          </div>
          <div className="flex gap-8 font-mono text-[12px] text-[var(--text-muted)]">
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">GitHub</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Terms</a>
          </div>
          <div className="font-mono text-[12px] text-[var(--text-muted)]">
            © 2026 {PLATFORM_NAME}. Solve it your way.
          </div>
        </footer>

      </div>
    </main>
  );
}
