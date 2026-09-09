import React from 'react';
import { Shield, Cpu, Zap, Award, Target, Compass } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          THE FUSION OF FANTASY & TECH
        </h2>
        <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
          ALPHA is KARE IEEE Education Society’s flagship 24-hour hackathon, creating an ancient dragon kingdom transformed into a futuristic technology arena.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <TiltCard className="p-8 flex flex-col justify-between">
          <div>
            <div className="p-3 w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Futuristic Arena</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Equipped with cloud infrastructure, high-speed connectivity, and AI dev suites, participants build real-world products under intense 24-hour pressure.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-sky-400">
            High-Performance Dev Suites
          </div>
        </TiltCard>

        <TiltCard className="p-8 flex flex-col justify-between">
          <div>
            <div className="p-3 w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Rapid Prototyping</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Transform ideas into production-ready software prototypes across Web3, AI, Cloud, Embedded IoT, Cyber Security, and Autonomous Systems.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-cyan-400">
            24-Hour Innovation Sprint
          </div>
        </TiltCard>

        <TiltCard className="p-8 flex flex-col justify-between">
          <div>
            <div className="p-3 w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Elite Recognition</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Compete for ₹1,50,000+ cash prizes, IEEE credentials, direct internship opps, official merit passes, and dragon kingdom trophies.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-semibold text-blue-400">
            IEEE Certified Accolades
          </div>
        </TiltCard>
      </div>

      {/* Purpose & Objectives banner */}
      <div className="p-8 md:p-12 rounded-3xl glass-card border border-sky-500/30 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-widest mb-3">
              <Target className="w-4 h-4" />
              <span>Core Mission</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
              Empowering Next-Gen Engineers
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              The primary purpose of ALPHA is to bridge academic theory with real-world engineering challenges. Supported by KARE IEEE Education Society, we foster collaborative problem-solving, clean architecture, and rapid deployment.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Open to 2nd, 3rd & 4th year undergraduate engineering students.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Interdisciplinary teams of 4 members.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Live mentoring by industry architects and faculty experts.
              </li>
            </ul>
          </div>
          <div className="relative flex justify-center">
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-sky-500/20 shadow-2xl text-center">
              <div className="text-4xl font-black text-sky-300 mb-1 text-glow">100 TEAMS</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest">MAXIMUM CAPACITY</div>
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300 font-semibold">
                Strict Slot Reservation System
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
