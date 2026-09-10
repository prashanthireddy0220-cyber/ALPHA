import React, { useState } from 'react';
import { Trophy, Medal, Award, Sparkles, Crown, Zap } from 'lucide-react';

export const PrizePoolSection = () => {
  const [activeHover, setActiveHover] = useState(null);

  const prizes = [
    {
      id: '2nd',
      place: '2ND PLACE',
      badge: 'RUNNER UP',
      amount: '₹5,000',
      icon: Medal,
      tier: '02',
      rank: 2,
      orderClass: 'order-2 lg:order-1',
      heightClass: 'lg:min-h-[320px] lg:mt-12',
      accentColor: 'cyan',
      theme: {
        border: 'border-cyan-400/40 hover:border-cyan-400/80',
        bg: 'from-slate-900/90 via-[#071328]/95 to-slate-950/90',
        glow: 'shadow-[0_0_30px_rgba(6,182,212,0.18)] hover:shadow-[0_0_45px_rgba(6,182,212,0.35)]',
        pill: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/30',
        iconBg: 'from-cyan-500/30 via-slate-800 to-cyan-950/50 text-cyan-200 border-cyan-400/40',
        textGradient: 'from-white via-cyan-100 to-cyan-300',
        baseFloor: 'from-cyan-500/30 to-blue-600/30 border-cyan-400/40'
      }
    },
    {
      id: '1st',
      place: '1ST PLACE',
      badge: 'CHAMPION',
      amount: '₹7,000',
      icon: Trophy,
      tier: '01',
      rank: 1,
      orderClass: 'order-1 lg:order-2',
      heightClass: 'lg:min-h-[390px] lg:mt-0',
      accentColor: 'gold',
      theme: {
        border: 'border-amber-400/70 hover:border-amber-300',
        bg: 'from-[#171105]/95 via-[#0d172e]/95 to-slate-950/95',
        glow: 'shadow-[0_0_50px_rgba(245,158,11,0.28)] hover:shadow-[0_0_70px_rgba(251,191,36,0.45)]',
        pill: 'bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
        iconBg: 'from-amber-400/40 via-yellow-500/20 to-amber-950/60 text-amber-300 border-amber-400/70',
        textGradient: 'from-yellow-100 via-amber-200 to-yellow-400',
        baseFloor: 'from-amber-500/40 via-yellow-400/40 to-amber-600/40 border-amber-400/60'
      }
    },
    {
      id: '3rd',
      place: '3RD PLACE',
      badge: '2ND RUNNER UP',
      amount: '₹3,000',
      icon: Award,
      tier: '03',
      rank: 3,
      orderClass: 'order-3 lg:order-3',
      heightClass: 'lg:min-h-[290px] lg:mt-20',
      accentColor: 'bronze',
      theme: {
        border: 'border-amber-600/40 hover:border-amber-500/70',
        bg: 'from-slate-900/90 via-[#150d1a]/95 to-slate-950/90',
        glow: 'shadow-[0_0_30px_rgba(217,119,6,0.15)] hover:shadow-[0_0_40px_rgba(217,119,6,0.3)]',
        pill: 'bg-amber-600/10 text-amber-400 border-amber-600/30',
        iconBg: 'from-amber-600/30 via-slate-800 to-orange-950/50 text-amber-400 border-amber-600/40',
        textGradient: 'from-white via-orange-100 to-amber-300',
        baseFloor: 'from-amber-600/30 to-orange-700/30 border-amber-600/40'
      }
    }
  ];

  return (
    <section id="prizes" className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-20 overflow-hidden">
      {/* Background Dragon Artwork Watermark (Subtle & Atmospheric) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04] bg-center bg-no-repeat bg-contain"
        style={{ backgroundImage: `url('/assets/alpha_artwork.png')` }}
      />

      {/* Ambient Lighting Gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[250px] bg-amber-500/15 rounded-full blur-[110px] pointer-events-none" />

      {/* ============================================================== */}
      {/* SECTION HEADER */}
      {/* ============================================================== */}
      <div className="text-center mb-16 relative z-10 space-y-3.5">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-sky-400/40 text-xs font-black text-sky-300 uppercase tracking-widest shadow-[0_0_20px_rgba(56,189,248,0.25)] backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>PRIZE POOL</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
          TOTAL CASH PRIZES
        </h2>

        {/* Total Cash Amount */}
        <div className="inline-block relative">
          <div className="text-3xl md:text-4xl font-black font-mono tracking-wider bg-gradient-to-r from-cyan-300 via-sky-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]">
            ₹15,000
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-1 opacity-70" />
        </div>

        {/* Subtitle */}
        <p className="text-sm md:text-base font-semibold text-slate-300 tracking-wide">
          “Compete. Innovate. Conquer.”
        </p>

        <p className="text-xs text-slate-400 max-w-md mx-auto font-light">
          Battle for the highest glory, official IEEE credentials, dragon trophies, and direct innovation opportunities.
        </p>
      </div>

      {/* ============================================================== */}
      {/* 3D CHAMPIONSHIP PODIUM ARENA */}
      {/* ============================================================== */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Podium Pillars Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 items-end">
          {prizes.map((p) => {
            const Icon = p.icon;
            const isWinner = p.rank === 1;

            return (
              <div
                key={p.id}
                onMouseEnter={() => setActiveHover(p.id)}
                onMouseLeave={() => setActiveHover(null)}
                className={`relative flex flex-col justify-between rounded-3xl p-6 md:p-8 border backdrop-blur-xl transition-all duration-500 cursor-default ${p.orderClass} ${p.heightClass} ${p.theme.border} ${p.theme.glow} bg-gradient-to-b ${p.theme.bg} ${
                  isWinner ? 'animate-podium-float' : 'hover:-translate-y-2'
                }`}
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Holographic Background Watermark Tier Number */}
                <span className="absolute top-4 right-5 text-6xl md:text-7xl font-black font-mono text-white/[0.03] select-none pointer-events-none">
                  {p.tier}
                </span>

                {/* Winner Crown & Ambient Top Aura (For 1st Place) */}
                {isWinner && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.6)] z-20">
                    <Crown className="w-3.5 h-3.5 fill-black" />
                    <span>GRAND CHAMPION</span>
                  </div>
                )}

                {/* Top Section: Icon, Badge, Rank, Amount */}
                <div className="text-center space-y-4 pt-2">
                  {/* Floating Icon Orb */}
                  <div className="relative inline-block">
                    {isWinner && (
                      <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-xl animate-pulse" />
                    )}
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center mx-auto shadow-2xl relative z-10 transition-transform duration-300 bg-gradient-to-br ${p.theme.iconBg} ${
                        isWinner ? 'animate-trophy-float' : 'hover:scale-105'
                      }`}
                    >
                      <Icon className={`${isWinner ? 'w-9 h-9 md:w-11 md:h-11' : 'w-8 h-8 md:w-9 md:h-9'}`} />
                    </div>
                  </div>

                  {/* Badge & Place Title */}
                  <div>
                    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-1.5 ${p.theme.pill}`}>
                      {p.badge}
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-white tracking-wide">
                      {p.place}
                    </h3>
                  </div>

                  {/* Prize Amount */}
                  <div className="py-3 border-y border-white/5 relative">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      CASH REWARD
                    </div>
                    <div
                      className={`text-3xl md:text-4xl font-black font-mono tracking-tight bg-gradient-to-r ${p.theme.textGradient} bg-clip-text text-transparent`}
                      style={{
                        textShadow: isWinner ? '0 0 25px rgba(245,158,11,0.4)' : '0 0 20px rgba(56,189,248,0.3)'
                      }}
                    >
                      {p.amount}
                    </div>
                  </div>
                </div>

                {/* Podium Pedestal Base Indicator */}
                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>TIER {p.tier} PODIUM</span>
                  </span>
                  <span className="text-slate-500 uppercase tracking-wider">
                    {isWinner ? '★ 1ST PLACE' : `#${p.rank} RANK`}
                  </span>
                </div>

                {/* Glowing Bottom Lip of the Pillar */}
                <div className={`absolute bottom-0 inset-x-4 h-1 rounded-full bg-gradient-to-r ${p.theme.baseFloor}`} />
              </div>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* UNIFIED HOLOGRAPHIC ARENA STAGE BASE */}
        {/* ============================================================== */}
        <div className="hidden lg:block relative mt-3">
          {/* Base Beam Glow */}
          <div className="h-3 w-full rounded-2xl bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent border-t border-cyan-400/40 shadow-[0_0_30px_rgba(0,240,255,0.4)]" />
          
          {/* Stage Platform Surface Reflection */}
          <div className="h-6 w-full bg-gradient-to-b from-cyan-950/40 via-slate-950/80 to-transparent rounded-b-3xl border-b border-sky-500/20 backdrop-blur-md flex items-center justify-around px-12 text-[10px] font-mono text-cyan-300/60 uppercase tracking-widest">
            <span>◄ 2ND PLACE PLATFORM</span>
            <span className="text-amber-400/80 font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" /> 1ST PLACE CHAMPIONSHIP PEDESTAL
            </span>
            <span>3RD PLACE PLATFORM ►</span>
          </div>
        </div>
      </div>
    </section>
  );
};
