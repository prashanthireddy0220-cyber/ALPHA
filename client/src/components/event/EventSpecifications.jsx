import React from 'react';
import { Calendar, Trophy, CreditCard, GraduationCap, Clock, BookOpen, CheckCircle2, Zap, Award, MapPin, Users } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const EventSpecifications = () => {
  return (
    <div className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
      
      {/* 2. EVENT SPECIFICATIONS HERO */}
      <div className="text-center mb-16 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-cyan-400/40 text-xs font-extrabold text-cyan-300 uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>COMPLETE EVENT BREAKDOWN</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase text-glow">
          EVENT SPECIFICATIONS
        </h1>
        <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
          Everything you need to know about the event.
        </p>
      </div>



      {/* 4. MAIN EVENT BREAKDOWN */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3">
          COMPLETE EVENT BREAKDOWN
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
          EVENT SPECIFICATIONS
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        
        {/* LEFT CARD: CORE COMPETITION */}
        <TiltCard className="p-8 border border-cyan-500/40 rounded-3xl glass-card bg-slate-950/90 shadow-[0_0_35px_rgba(0,240,255,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase tracking-wider">
                CORE COMPETITION
              </span>
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                <Clock className="w-7 h-7" />
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-wide">
              24-HOUR HACKATHON
            </h3>
            
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-8 font-light">
              An intense 24-hour non-stop hackathon where teams build innovative full-stack solutions and compete for the ₹15,000 prize pool.
            </p>

            <ul className="space-y-4 text-xs md:text-sm text-slate-200">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium">Duration:</span>{' '}
                  <strong className="text-white font-bold">24 Hours Non-Stop</strong>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium">Venue:</span>{' '}
                  <strong className="text-white font-bold">KS Auditorium, KARE</strong>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium">Team Requirement:</span>{' '}
                  <strong className="text-white font-bold">Strictly 4 Members</strong>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium">Entry Fee:</span>{' '}
                  <strong className="text-cyan-300 font-bold">₹350 per member (₹1,400 per team)</strong>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <span>Competitive Hackathon Track</span>
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
        </TiltCard>

        {/* RIGHT CARD: ACADEMIC CERTIFICATION */}
        <TiltCard className="p-8 border border-purple-500/40 rounded-3xl glass-card bg-slate-950/90 shadow-[0_0_35px_rgba(168,85,247,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 uppercase tracking-wider">
                ACADEMIC CERTIFICATION
              </span>
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-400/30 text-purple-300">
                <BookOpen className="w-7 h-7" />
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-wide">
              55-HOUR LEARNING EXPERIENCE
            </h3>
            
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-8 font-light">
              Earn 2EE Academic Credits through a complete 55-hour learning journey combining guided course learning, the 24-hour hands-on hackathon, and a 1-hour knowledge assessment quiz.
            </p>

            <ul className="space-y-4 text-xs md:text-sm text-slate-200">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-300 font-bold">30 Hours:</strong>{' '}
                  <span className="text-slate-200 font-medium">Guided Course & Learning</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300 font-bold">24 Hours:</strong>{' '}
                  <span className="text-slate-200 font-medium">Hands-on Hackathon</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-300 font-bold">1 Hour:</strong>{' '}
                  <span className="text-slate-200 font-medium">Knowledge Assessment Quiz</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium">Academic Credits:</span>{' '}
                  <strong className="text-white font-bold">Official 2EE Credits for all participants</strong>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-400 uppercase tracking-wider">
            <span>IEEE & Institutional Accredited</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
        </TiltCard>

      </div>

      {/* 6. BOTTOM HIGHLIGHT */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full glass-card border border-amber-400/50 bg-slate-950/90 shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_45px_rgba(245,158,11,0.4)] transition-all">
          <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
          <span className="text-xs md:text-sm font-black text-amber-300 tracking-wider uppercase">
            ₹15,000 TOTAL CASH PRIZE POOL
          </span>
        </div>
      </div>

    </div>
  );
};
