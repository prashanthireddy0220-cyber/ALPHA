import React from 'react';
import { Mail, Phone, MapPin, Globe, MessageSquare } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';
import { useSettings } from '../../contexts/SettingsContext';

export const ContactSection = () => {
  const { settings } = useSettings();

  return (
    <section id="contact" className="py-24 px-4 md:px-8 max-w-6xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-4">
          <MessageSquare className="w-4 h-4" />
          <span>DRAGON TOWER</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          GET IN TOUCH
        </h2>
        <p className="mt-4 text-slate-400 max-w-lg mx-auto text-sm font-light">
          Have questions or need assistance? Reach out to the ALPHA organizing committee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TiltCard className="p-8 flex flex-col items-center text-center">
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-300 mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">EMAIL SUPPORT</h3>
          <p className="text-xs text-slate-300 mb-4 font-light">Direct email for inquiries & team updates</p>
          <a href="mailto:ieee.edusoc@klu.ac.in" className="text-sm font-bold text-cyan-300 hover:underline">
            ieee.edusoc@klu.ac.in
          </a>
        </TiltCard>

        <TiltCard className="p-8 flex flex-col items-center text-center">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">ORGANIZER CONTACTS</h3>
          <p className="text-xs text-slate-300 mb-4 font-light">Student Chairs & Helpline</p>
          <div className="text-xs text-slate-200 font-semibold space-y-1">
            <p>President: +91 98765 43210</p>
            <p>Secretary: +91 98765 43211</p>
          </div>
        </TiltCard>

        <TiltCard className="p-8 flex flex-col items-center text-center">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-300 mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">LOCATION & VENUE</h3>
          <p className="text-xs text-slate-300 mb-4 font-light">Event location on campus</p>
          <p className="text-xs font-semibold text-slate-200">{settings.venue}</p>
        </TiltCard>
      </div>

      <div className="mt-12 text-center text-xs text-slate-500 font-light">
        © 2026 ALPHA — KARE IEEE Education Society. All rights reserved.
      </div>
    </section>
  );
};
