import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MessageCircle, Globe, Share2, Mail, MapPin } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/90 pt-8 pb-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <img src="/assets/kare_logo.jpg" alt="Logo" className="w-14 h-14 md:w-16 md:h-16 rounded-full object-contain border border-sky-500/30 p-0.5" />
            <div>
              <span className="text-base font-black tracking-widest text-white block">ALPHA 2026</span>
              <span className="text-xs text-slate-400 font-medium">KARE IEEE Education Society</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-light leading-relaxed max-w-md">
            The premier 24-hour hackathon & 55-hour academic credit learning experience. Rise, conquer, and rule the technology arena.
          </p>
        </div>

        {/* Official Social Logos */}
        <div>
          <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-4">COMMUNITY & SOCIALS</h4>
          
          <div className="flex items-center gap-4">
            {/* WhatsApp Logo Button */}
            <a
              href="https://chat.whatsapp.com/BST4xC9Kdkc3ccZ30BLWYo"
              target="_blank"
              rel="noreferrer"
              title="Official WhatsApp Group"
              className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-1 group"
            >
              <svg className="w-6 h-6 fill-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M12.031 0C5.394 0 0 5.392 0 12.029c0 2.12.553 4.192 1.604 6.013L.044 24l6.126-1.606C7.94 23.42 9.97 24 12.03 24c6.637 0 12.031-5.392 12.031-12.029C24.061 5.392 18.667 0 12.031 0zm.006 22.012c-1.8 0-3.565-.484-5.11-1.402l-.367-.218-3.795.996 1.012-3.699-.239-.38C2.56 15.748 2.01 13.923 2.01 12.029c0-5.525 4.492-10.017 10.021-10.017 5.53 0 10.022 4.492 10.022 10.017 0 5.526-4.492 10.018-10.016 10.018zm5.495-7.508c-.301-.15-1.782-.879-2.057-.979-.275-.101-.476-.15-.676.15-.2.301-.776.979-.951 1.18-.175.2-.35.226-.651.076-.301-.15-1.271-.469-2.422-1.496-.895-.799-1.5-1.786-1.776-2.259-.275-.473-.029-.728.121-.877.135-.134.301-.35.451-.526.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.63-.926-2.233-.244-.588-.492-.508-.676-.517l-.576-.01c-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.507 0 1.479 1.077 2.908 1.227 3.109.15.201 2.119 3.236 5.134 4.54.717.31 1.277.495 1.713.633.72.229 1.375.197 1.892.12.576-.086 1.782-.727 2.032-1.429.25-.702.25-1.303.175-1.429-.075-.126-.276-.201-.577-.351z"/>
              </svg>
            </a>

            {/* Instagram Logo Button */}
            <a
              href={settings.instagramLink || 'https://www.instagram.com/kare_ieee_eds_official/'}
              target="_blank"
              rel="noreferrer"
              title="Official Instagram Page"
              className="p-3.5 rounded-2xl bg-pink-950/60 border border-pink-500/40 hover:border-pink-400 hover:bg-pink-900/60 shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all transform hover:-translate-y-1 group"
            >
              <svg className="w-6 h-6 fill-pink-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* LinkedIn Logo Button */}
            <a
              href={settings.linkedinLink || 'https://www.linkedin.com/in/ieee-education-society-kare-97b490381/'}
              target="_blank"
              rel="noreferrer"
              title="Official LinkedIn Profile"
              className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-500/40 hover:border-blue-400 hover:bg-blue-900/60 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all transform hover:-translate-y-1 group"
            >
              <svg className="w-6 h-6 fill-blue-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-light">
        <p>© 2026 ALPHA — KARE IEEE Education Society. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Terms & Conditions</span>
          <span className="hover:underline cursor-pointer">Code of Conduct</span>
        </div>
      </div>
    </footer>
  );
};
