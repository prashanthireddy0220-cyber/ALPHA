import React from 'react';
import { Scroll, ShieldAlert, CheckCircle, AlertTriangle, FileCode, Lock } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const RulesSection = () => {
  const rules = [
    {
      title: 'ELIGIBILITY & COMPOSITION',
      icon: ShieldAlert,
      items: [
        'Open to 2nd, 3rd, and 4th year undergraduate students across all engineering branches.',
        'Teams must consist of exactly 4 members (configurable by event management).',
        'Cross-departmental and cross-year teams are permitted.',
        'Every participant must present a valid college ID card upon QR check-in at the venue.'
      ]
    },
    {
      title: 'REGISTRATION & PAYMENT RULES',
      icon: Lock,
      items: [
        'A team slot reservation is held for 10 minutes upon initial registration.',
        'Payment UTR must be an exact 12-digit numeric transaction reference.',
        'Upload of a clear payment screenshot is mandatory for verification.',
        'Registration numbers must be unique; no participant can join multiple teams.'
      ]
    },
    {
      title: 'DEVELOPMENT & CODE INTEGRITY',
      icon: FileCode,
      items: [
        'All project code must be written during the 24-hour hackathon duration.',
        'Pre-existing open-source libraries and APIs may be used if declared in documentation.',
        'Plagiarism or copying pre-built commercial templates will result in immediate disqualification.',
        'GitHub repository commits will be audited for timeline integrity.'
      ]
    },
    {
      title: 'CODE OF CONDUCT & DISQUALIFICATION',
      icon: AlertTriangle,
      items: [
        'Maintain professional behavior towards fellow participants, mentors, and volunteers.',
        'Damage to venue equipment or unauthorized network intrusion will trigger immediate expulsion.',
        'Jury decisions on judging, shortlisting, and prizes are final and binding.'
      ]
    }
  ];

  return (
    <section id="rules" className="py-24 px-4 md:px-8 max-w-6xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-4">
          <Scroll className="w-4 h-4" />
          <span>THE LAWS OF ALPHA</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          RULES & REGULATIONS
        </h2>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm font-light">
          Strict compliance with the laws of ALPHA is mandatory for all competing teams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <TiltCard key={rule.title} className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">{rule.title}</h3>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                {rule.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
};
