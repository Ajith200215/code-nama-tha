"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface AuroraBarsProps {
  barCount?: number;
  colors?: string[];
  maxHeightRatio?: number;
  minHeightRatio?: number;
  speed?: number;
  gap?: number;
  blur?: number;
  background?: string;
  className?: string;
}

export function AuroraBars({
  barCount = 60,
  colors = ["#ff5aa6", "#ff2d78", "#9c1650", "#2a0616", "#00000000"],
  maxHeightRatio = 0.85,
  minHeightRatio = 0.14,
  speed = 3,
  gap = 0,
  blur = 0,
  background = "#000000",
  className,
}: AuroraBarsProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const gradient = useMemo(() => {
    const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`);
    return `linear-gradient(to top, ${stops.join(", ")})`;
  }, [colors]);

  return (
    <div 
      className={cn("flex items-end justify-center overflow-hidden", className)} 
      style={{ backgroundColor: background, gap: `${gap}px`, filter: blur > 0 ? `blur(${blur}px)` : 'none' }}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, i) => {
        // Calculate a pseudo-random initial phase and amplitude for each bar
        const phase = (i / barCount) * Math.PI * 2;
        const amplitude = (maxHeightRatio - minHeightRatio) / 2;
        const mid = minHeightRatio + amplitude;
        
        // Use a CSS variable for the animation delay to create the wave effect
        const delay = -((i / barCount) * 10) / (speed || 1);
        const duration = 5 / (speed || 1);

        return (
          <div
            key={i}
            className="h-full transform origin-bottom"
            style={{
              width: `${100 / barCount}%`,
              background: gradient,
              ...(mounted && speed > 0 ? {
                animation: `aurora-wave ${duration}s ease-in-out infinite alternate`,
                animationDelay: `${delay}s`,
                transform: `scaleY(${minHeightRatio})`
              } : {
                transform: `scaleY(${mid + amplitude * Math.sin(phase)})`
              })
            }}
          />
        );
      })}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes aurora-wave {
          0% { transform: scaleY(${minHeightRatio}); }
          100% { transform: scaleY(${maxHeightRatio}); }
        }
        @media (prefers-reduced-motion: reduce) {
          .flex-1 { animation: none !important; }
        }
      `}} />
    </div>
  );
}
