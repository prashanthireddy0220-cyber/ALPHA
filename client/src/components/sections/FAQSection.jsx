import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: 'Who can register for ALPHA 2026?',
      a: 'ALPHA is open to undergraduate engineering students in their 2nd, 3rd, or 4th year from any branch (CSE, ECE, IT, EEE, MECH, CIVIL, BIO, etc.).'
    },
    {
      q: 'What is the team size requirement?',
      a: 'The default team size is 4 members. You can form cross-departmental and cross-year teams as long as all members meet eligibility.'
    },
    {
      q: 'How does the 10-minute slot reservation work?',
      a: 'When you initiate registration, one team slot is temporarily reserved for 10 minutes. Complete payment and UTR submission within this countdown to confirm your slot.'
    },
    {
      q: 'What is the registration fee and how do I pay?',
      a: 'The registration fee is ₹350 per member (₹1,400 for a team of 4). Payment is made via direct bank transfer to UNION BANK OF INDIA (Account: IEEE STUDENT BRANCH), after which you enter the 12-digit UTR number and upload your payment screenshot.'
    },
    {
      q: 'When and how will payment verification be confirmed?',
      a: 'Admin verifies UTR and screenshots within 24-48 hours. Once verified, your status updates to VERIFIED on your Participant Dashboard, and your official ALPHA Event Pass with QR code becomes downloadable.'
    },
    {
      q: 'Will accommodation and food be provided?',
      a: 'Yes! Accommodation options (Day Scholar vs Hosteller with specific hostel choices) are captured during registration. High-speed Wi-Fi, meals, and snacks are provided at KLU campus.'
    }
  ];

  return (
    <section id="faq" className="py-24 px-4 md:px-8 max-w-4xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-4">
          <HelpCircle className="w-4 h-4" />
          <span>ORACLE OF ALPHA</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <p className="mt-4 text-slate-400 max-w-lg mx-auto text-sm font-light">
          Everything you need to know about ALPHA 2026 hackathon registration, rules, and venue.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <TiltCard key={idx} className="overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-white text-sm md:text-base hover:text-sky-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-sky-400 transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180 text-cyan-300' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-0 text-xs md:text-sm text-slate-300 font-light leading-relaxed border-t border-slate-800/80 mt-2">
                  <p className="pt-4">{faq.a}</p>
                </div>
              )}
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
};
