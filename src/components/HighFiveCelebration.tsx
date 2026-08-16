'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface HighFiveCelebrationProps {
  taskTitle: string;
  onClose: () => void;
}

export const HighFiveCelebration: React.FC<HighFiveCelebrationProps> = ({ taskTitle, onClose }) => {
  const [clapped, setClapped] = useState(false);

  useEffect(() => {
    // Trigger the slap / clap sound effect (synthesized via Web Audio API)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      // Audio autoplay policy fallback
    }

    const clapTimer = setTimeout(() => {
      setClapped(true);
    }, 150);

    const autoClose = setTimeout(() => {
      onClose();
    }, 2400);

    return () => {
      clearTimeout(clapTimer);
      clearTimeout(autoClose);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-slate-900/20 backdrop-blur-2xs transition-all duration-300 animate-in fade-in">
      {/* Floating Celebration Particles */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xl lg:text-2xl animate-ping"
            style={{
              transform: `rotate(${i * 22.5}deg) translateY(-${60 + (i % 4) * 25}px)`,
              animationDuration: `${0.8 + (i % 3) * 0.3}s`,
              animationIterationCount: 1,
            }}
          >
            {['✨', '🎉', '🔥', '🌟', '💥', '⚡', '🇱🇧', '👏'][i % 8]}
          </div>
        ))}
      </div>

      {/* Main High Five Card & Animation */}
      <div className="relative flex flex-col items-center p-6 bg-white/95 border-2 border-emerald-400 rounded-3xl shadow-2xl scale-100 animate-bounce pointer-events-auto max-w-sm mx-4 text-center">
        {/* Animated Clapping Hands */}
        <div className="relative flex items-center justify-center gap-2 my-2">
          {/* Left Hand */}
          <div 
            className={`text-6xl lg:text-7xl transition-transform duration-200 ease-out transform ${
              clapped ? 'translate-x-1.5 rotate-12 scale-110' : '-translate-x-12 -rotate-12 scale-90'
            }`}
          >
            🫲
          </div>

          {/* Impact Spark / Blast */}
          {clapped && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 bg-amber-400/40 rounded-full animate-ping" />
              <span className="text-3xl animate-spin">💥</span>
            </div>
          )}

          {/* Right Hand */}
          <div 
            className={`text-6xl lg:text-7xl transition-transform duration-200 ease-out transform ${
              clapped ? '-translate-x-1.5 -rotate-12 scale-110' : 'translate-x-12 rotate-12 scale-90'
            }`}
          >
            🫱
          </div>
        </div>

        {/* High Five Title */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-black text-xl lg:text-2xl tracking-wide uppercase">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>HIGH FIVE! 🎉</span>
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
          </div>

          <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline shrink-0" />
            <span className="line-clamp-1">{taskTitle}</span>
          </p>

          <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-3 py-1 rounded-full mt-1">
            Status Changed to Completed! 🚀
          </span>
        </div>
      </div>
    </div>
  );
};
