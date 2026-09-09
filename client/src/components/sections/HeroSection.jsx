import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Users, ArrowRight, Flame, CreditCard, GraduationCap } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { TiltCard } from '../common/TiltCard';
import { CapacityDisplay } from './CapacityDisplay';

export const HeroSection = () => {
  const { settings } = useSettings();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-10-01T09:00:00+05:30').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen pt-28 md:pt-36 pb-20 px-4 md:px-8 flex flex-col items-center justify-center overflow-hidden bg-transparent">
      {/* Subtle Atmospheric Glow for Logo Highlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] sm:h-[700px] bg-gradient-to-tr from-cyan-500/15 via-sky-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* ================= HERO CONTENT CONTAINER ================= */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center">

        {/* KARE IEEE Education Society Organization Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-card border border-sky-400/40 mb-6 shadow-[0_0_30px_rgba(0,240,255,0.3)] backdrop-blur-xl animate-pulse">
          <img
            src="/assets/kare_logo.jpg"
            alt="KARE IEEE Education Society Logo"
            className="w-6 h-6 md:w-7 md:h-7 rounded-full object-contain"
          />
          <span className="text-xs md:text-sm font-bold tracking-widest text-sky-200 uppercase">
            KARE IEEE EDUCATION SOCIETY
          </span>
        </div>

        {/* Floating Transparent ALPHA Logo Artwork (NO Rectangular Box) */}
        <div className="relative w-full max-w-4xl md:max-w-5xl mx-auto my-3 md:my-5 flex flex-col items-center justify-center">
          <img
            src="/assets/alpha_artwork.png"
            alt="ALPHA 2026 - RISE. CONQUER. RULE."
            className="w-full h-auto max-h-[380px] sm:max-h-[460px] md:max-h-[540px] object-contain blend-screen-logo transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>

        {/* Subtitle / Tagline Description */}
        <p className="max-w-2xl text-center text-slate-300 text-sm md:text-lg mb-10 leading-relaxed font-light drop-shadow-md">
          Step into the ultimate technology arena. 24 hours of intense innovation and cutting-edge software engineering.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-8 w-full max-w-md justify-center">
          <Link
            to="/register"
            className="w-full sm:w-auto px-9 py-4 text-xs md:text-sm font-extrabold tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-full shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:shadow-[0_0_60px_rgba(0,240,255,0.9)] transition-all transform hover:-translate-y-1 text-center flex items-center justify-center gap-2.5 group"
          >
            <Flame className="w-5 h-5 text-black animate-bounce" />
            <span>REGISTER YOUR TEAM</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-9 py-4 text-xs md:text-sm font-bold tracking-wider text-sky-300 glass-button rounded-full text-center hover:border-sky-400"
          >
            EXPLORE ARENA
          </a>
        </div>

        {/* Registration Status section placed BELOW the REGISTER YOUR TEAM button */}
        <CapacityDisplay />

        {/* Event Overview Cards Grid (From Pic 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl mb-12">
          {/* CARD 1: EVENT DATE */}
          <TiltCard className="p-6 border border-cyan-500/30 rounded-2xl glass-card bg-slate-950/80 shadow-[0_0_25px_rgba(0,240,255,0.1)] flex flex-col justify-between hover:border-cyan-400/60 transition-all text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                EVENT DATE
              </span>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-white tracking-wide font-mono">
                3rd–4th October
              </div>
              <div className="text-[10px] text-cyan-400 font-semibold mt-1">
                2026 Edition
              </div>
            </div>
          </TiltCard>

          {/* CARD 2: PRIZE POOL */}
          <TiltCard className="p-6 border border-amber-500/30 rounded-2xl glass-card bg-slate-950/80 shadow-[0_0_25px_rgba(245,158,11,0.1)] flex flex-col justify-between hover:border-amber-400/60 transition-all text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                PRIZE POOL
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-amber-300 tracking-wide font-mono text-glow">
                ₹15,000
              </div>
              <div className="text-[10px] text-amber-400 font-semibold mt-1">
                Total Cash Prize
              </div>
            </div>
          </TiltCard>

          {/* CARD 3: ENTRY FEE */}
          <TiltCard className="p-6 border border-sky-500/30 rounded-2xl glass-card bg-slate-950/80 shadow-[0_0_25px_rgba(56,189,248,0.1)] flex flex-col justify-between hover:border-sky-400/60 transition-all text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                ENTRY FEE
              </span>
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-300">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-lg md:text-xl font-black text-white tracking-wide">
                ₹350 <span className="text-xs text-slate-400 font-normal">/ Person</span>
              </div>
              <div className="text-[11px] font-bold text-sky-400 mt-0.5">
                ₹1,400 <span className="text-[9px] text-slate-400 font-normal">/ Team</span>
              </div>
            </div>
          </TiltCard>

          {/* CARD 4: ACADEMIC CREDIT */}
          <TiltCard className="p-6 border border-purple-500/30 rounded-2xl glass-card bg-slate-950/80 shadow-[0_0_25px_rgba(168,85,247,0.1)] flex flex-col justify-between hover:border-purple-400/60 transition-all text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                ACADEMIC CREDIT
              </span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-400/30 text-purple-300">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-purple-300 tracking-wide font-mono">
                2EE Credits
              </div>
              <div className="text-[10px] text-purple-400 font-semibold mt-1">
                Official Institutional Credit
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Countdown Timer */}
        <div className="p-6 rounded-3xl glass-card border border-sky-500/30 flex flex-col items-center max-w-xl w-full shadow-[0_0_30px_rgba(0,240,255,0.2)] bg-slate-950/60 backdrop-blur-xl">
          <span className="text-xs font-bold tracking-widest text-sky-300 uppercase mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>COUNTDOWN TO BATTLE</span>
          </span>
          <div className="grid grid-cols-4 gap-3 md:gap-4 text-center w-full">
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-sky-500/30">
              <span className="text-2xl md:text-3xl font-black text-white">{timeLeft.days}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">Days</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-sky-500/30">
              <span className="text-2xl md:text-3xl font-black text-white">{timeLeft.hours}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">Hours</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-sky-500/30">
              <span className="text-2xl md:text-3xl font-black text-white">{timeLeft.minutes}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">Mins</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-sky-500/30">
              <span className="text-2xl md:text-3xl font-black text-cyan-400 text-glow">{timeLeft.seconds}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">Secs</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

