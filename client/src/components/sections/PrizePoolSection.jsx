import React from 'react';
import { Trophy, Medal, Award, Flame } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { TiltCard } from '../common/TiltCard';

export const PrizePoolSection = () => {
  const { settings } = useSettings();

  return (
    <section id="prizes" className="py-24 px-4 md:px-8 max-w-6xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-4">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>REWARDS & RECOGNITION</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          PRIZE POOL DISCLOSURE
        </h2>
        <div className="mt-4 text-3xl md:text-5xl font-black text-cyan-300 font-mono text-glow">
          ₹15,000 TOTAL CASH PRIZES
        </div>
        <p className="mt-2 text-slate-400 text-sm font-light max-w-lg mx-auto">
          Plus IEEE merit certificates, direct internship opportunities, and dragon trophies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 2ND PLACE */}
        <TiltCard className="p-8 text-center flex flex-col justify-between border-slate-700 md:order-1">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-300 border border-slate-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Medal className="w-8 h-8" />
            </div>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">RUNNER UP</span>
            <h3 className="text-xl font-black text-white my-2">2ND PLACE</h3>
            <div className="text-3xl font-black text-cyan-300 my-4 font-mono">₹5,000</div>
          </div>
          <p className="text-xs text-slate-400 font-light">Cash Prize + Silver Trophy + Silver IEEE Certificate</p>
        </TiltCard>

        {/* 1ST PLACE */}
        <TiltCard className="p-8 text-center flex flex-col justify-between border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] md:-translate-y-4 md:order-2">
          <div>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/30 via-yellow-400/20 to-transparent text-amber-400 border border-amber-400/50 flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <Trophy className="w-10 h-10" />
            </div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest block flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" /> CHAMPIONS
            </span>
            <h3 className="text-2xl font-black text-white my-2">1ST PLACE</h3>
            <div className="text-4xl font-black text-amber-300 my-4 font-mono text-glow">₹7,000</div>
          </div>
          <p className="text-xs text-slate-300 font-semibold">Grand Cash Prize + Gold Dragon Trophy + IEEE Gold Excellence Certificate</p>
        </TiltCard>

        {/* 3RD PLACE */}
        <TiltCard className="p-8 text-center flex flex-col justify-between border-amber-800/40 md:order-3">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-amber-950/40 text-amber-600 border border-amber-700/40 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest block">2ND RUNNER UP</span>
            <h3 className="text-xl font-black text-white my-2">3RD PLACE</h3>
            <div className="text-3xl font-black text-cyan-300 my-4 font-mono">₹3,000</div>
          </div>
          <p className="text-xs text-slate-400 font-light">Cash Prize + Bronze Trophy + Bronze IEEE Certificate</p>
        </TiltCard>
      </div>
    </section>
  );
};
