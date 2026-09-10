import React from 'react';
import { Clock, CheckCircle2, Flame, Play, Code2, Send, Award, Trophy } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const TimelineSection = () => {
  const steps = [
    {
      num: '01',
      title: 'REGISTRATION & SLOT RESERVATION',
      date: 'Feb 15 - Mar 25, 2026',
      desc: 'Teams register with 4 members, reserve their slot with a 10-minute timer, submit UTR & screenshot verification.',
      icon: CheckCircle2,
      status: 'Active'
    },
    {
      num: '02',
      title: 'SHORTLISTING & PASS ISSUANCE',
      date: 'Mar 26, 2026',
      desc: 'Admin verifies payment UTRs, approves team slots, and generates digital ALPHA Event Passes with unique QR codes.',
      icon: Flame,
      status: 'Upcoming'
    },
    {
      num: '03',
      title: 'HACKATHON OPENING CEREMONY',
      date: 'Mar 28, 2026 - 09:00 AM',
      desc: 'Inauguration by KARE IEEE Education Society leaders, track problem statement deep dive, and volunteer QR check-in.',
      icon: Play,
      status: 'Upcoming'
    },
    {
      num: '04',
      title: '24-HOUR DEVELOPMENT SPRINT',
      date: 'Mar 28 10:00 AM - Mar 29 10:00 AM',
      desc: 'Non-stop hacking, midnight mentoring sessions, energy drinks, and dragon realm mini-quests.',
      icon: Code2,
      status: 'Upcoming'
    },
    {
      num: '05',
      title: 'PROJECT SUBMISSION',
      date: 'Mar 29, 2026 - 10:00 AM',
      desc: 'Codebase freeze, GitHub repo submission, architecture documentation, and live demo link upload.',
      icon: Send,
      status: 'Upcoming'
    },
    {
      num: '06',
      title: 'JURY EVALUATION & DEMO REVIEWS',
      date: 'Mar 29, 2026 - 11:00 AM',
      desc: 'Expert jury panel evaluates live working demos, code quality, technical depth, and innovation.',
      icon: Award,
      status: 'Upcoming'
    },
    {
      num: '07',
      title: 'GRAND VICTORY & AWARDS CEREMONY',
      date: 'Mar 29, 2026 - 03:00 PM',
      desc: 'Winner announcement, cash prize distribution of ₹1,50,000, and trophy crowning in KS AUDITORIUM.',
      icon: Trophy,
      status: 'Upcoming'
    }
  ];

  return (
    <section id="timeline" className="py-24 px-4 md:px-8 max-w-5xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-4">
          <Clock className="w-4 h-4" />
          <span>CHRONICLES OF BATTLE</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          EVENT TIMELINE
        </h2>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm font-light">
          Follow the chronological roadmap from registration to victory in the dragon arena.
        </p>
      </div>

      <div className="relative border-l-2 border-sky-500/30 ml-4 md:ml-32 space-y-12">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="relative pl-8 md:pl-12 group">
              {/* Timeline Marker Icon */}
              <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-slate-950 border-2 border-sky-400 flex items-center justify-center text-sky-300 shadow-[0_0_15px_rgba(0,240,255,0.5)] group-hover:scale-125 transition-transform">
                <Icon className="w-4 h-4" />
              </div>

              {/* Step Card */}
              <TiltCard className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 w-fit">
                    PHASE {step.num}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {step.date}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-extrabold text-white mb-2 group-hover:text-sky-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
                  {step.desc}
                </p>
              </TiltCard>
            </div>
          );
        })}
      </div>
    </section>
  );
};
