import React from 'react';
import { Award, Shield, Sparkles } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const SponsorsSection = () => {
  const sponsors = [
    { name: 'KARE IEEE Education Society', tier: 'Title Organizer', logo: '/assets/kare_logo.jpg' },
    { name: 'IEEE Region 10', tier: 'Global Partner', logo: '/assets/kare_logo.jpg' },
    { name: 'Klu Tech Incubation', tier: 'Ecosystem Partner', logo: '/assets/kare_logo.jpg' },
    { name: 'Cybersec Guild', tier: 'Track Sponsor', logo: '/assets/kare_logo.jpg' }
  ];

  return (
    <section id="sponsors" className="py-24 px-4 md:px-8 max-w-6xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-4">
          <Award className="w-4 h-4" />
          <span>ALLIES OF ALPHA</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          OUR SPONSORS & PARTNERS
        </h2>
        <p className="mt-4 text-slate-400 max-w-lg mx-auto text-sm font-light">
          Powered by leading technology organizations and IEEE societies dedicated to engineering excellence.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {sponsors.map((s, idx) => (
          <TiltCard key={idx} className="p-6 text-center flex flex-col items-center justify-center">
            <div className="relative p-2 rounded-full bg-slate-950 border border-sky-500/30 mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <img src={s.logo} alt={s.name} className="w-16 h-16 rounded-full object-contain" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{s.name}</h3>
            <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">{s.tier}</span>
          </TiltCard>
        ))}
      </div>
    </section>
  );
};
