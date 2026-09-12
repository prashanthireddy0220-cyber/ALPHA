import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, MapPin, Clock, Users, Download, Sparkles } from 'lucide-react';

export const OfficialEventPass = ({
  team = {},
  members = [],
  payment = {},
  eventSettings = {},
  showActions = true
}) => {
  const teamName = team.teamName || team.name || 'ALPHA TEAM';
  const teamId = team.teamId || 'ALPHA-001';
  const memberList = (members && members.length > 0) ? members : (team.members || []);
  const lead = memberList[0] || {};
  const leadName = team.leadName || lead.name || 'TEAM LEAD';
  const leadEmail = team.leadEmail || lead.email || '';
  const utr = payment.utr || team.utr || team.payment?.utr || 'N/A';
  const venue = eventSettings.venue || team.venue || 'KS AUDITORIUM';
  const reportingTime = eventSettings.eventDate || team.eventDate || '08:30 AM, 1st October 2026';
  const track = team.track || 'AI & Machine Learning';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-pass-wrapper w-full max-w-4xl mx-auto">
      {/* Action Header for Screen View */}
      {showActions && (
        <div className="no-print flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              OFFICIAL ADMISSION PASS
            </span>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-extrabold tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 cursor-pointer uppercase"
          >
            <Download className="w-4 h-4" />
            <span>PRINT / DOWNLOAD PASS</span>
          </button>
        </div>
      )}

      {/* Main Official Event Pass Card - Engineered for Exactly 1 Page Print */}
      <div className="printable-event-pass relative overflow-hidden rounded-3xl bg-[#030712] border border-cyan-500/40 p-5 md:p-6 shadow-[0_12px_45px_rgba(0,0,0,0.85)] text-slate-100 select-none">
        
        {/* Subtle Ambient Cyber Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none no-print" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl pointer-events-none no-print" />

        {/* SECTION 1: Top Header (Logo + Team Details on Left, QR Code on Right) */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/90">
          
          {/* Left Column: Society Branding & Team Title */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-sky-500/10 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.25)] shrink-0">
                <img
                  src="/assets/kare_logo.jpg"
                  alt="KARE Logo"
                  className="w-10 h-10 rounded-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm md:text-base font-black tracking-widest text-white uppercase flex items-center gap-1.5">
                  <span>ALPHA 2026 OFFICIAL PASS</span>
                </h1>
                <p className="text-[10px] md:text-[11px] font-semibold text-slate-400 tracking-wider">
                  KARE IEEE EDUCATION SOCIETY STUDENT CHAPTER
                </p>
              </div>
            </div>

            {/* Big Team Name */}
            <div className="pt-1">
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase block">
                TEAM NAME
              </span>
              <h2 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase text-glow leading-tight">
                {teamName}
              </h2>
            </div>

            {/* Team Lead */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <div className="inline-flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-extrabold text-[9px] uppercase border border-cyan-400/40">
                  TEAM LEAD
                </span>
                <span className="text-xs font-bold text-slate-200 uppercase">
                  {leadName} {leadEmail && <span className="text-slate-400 text-[10px] lowercase">({leadEmail})</span>}
                </span>
              </div>
            </div>

            {/* Team ID Large Glow */}
            <div className="pt-0.5 flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TEAM ID:</span>
              <span className="text-xl md:text-2xl font-black text-cyan-300 font-mono tracking-widest text-dragon-glow">
                {teamId}
              </span>
            </div>
          </div>

          {/* Right Column: Scan to Verify QR Badge Container */}
          <div className="shrink-0 w-full md:w-auto flex md:flex-col items-center justify-between md:justify-center p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-inner space-y-1.5">
            <div className="flex items-center gap-1.5 pb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-extrabold text-emerald-300 tracking-wider uppercase">
                ACTIVE ADMISSION PASS
              </span>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-200">
              <QRCodeSVG
                value={`https://alpha-ieee-eds.vercel.app/verify/${teamId}`}
                size={95}
                level="H"
                includeMargin={false}
              />
            </div>
            <span className="text-[9px] font-extrabold text-cyan-300 uppercase tracking-widest font-mono pt-0.5">
              SCAN TO VERIFY
            </span>
          </div>
        </div>

        {/* SECTION 2: Middle Meta Strip (Event Venue, Reporting Time, Payment Ref) */}
        <div className="relative z-10 my-3.5 grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Event Venue */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>EVENT VENUE</span>
            </span>
            <span className="text-xs md:text-sm font-extrabold text-white">
              {venue}
            </span>
          </div>

          {/* Reporting Time */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>REPORTING TIME</span>
            </span>
            <span className="text-xs md:text-sm font-extrabold text-cyan-300">
              {reportingTime}
            </span>
          </div>

          {/* Payment Ref */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              PAYMENT REF (UTR)
            </span>
            <span className="text-xs md:text-sm font-black font-mono text-emerald-400 tracking-wider">
              {utr}
            </span>
          </div>
        </div>

        {/* SECTION 3: Team Participants (4 Members) Grid */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-black text-slate-200 tracking-widest uppercase">
              TEAM PARTICIPANTS ({memberList.length} MEMBERS)
            </span>
          </div>

          {/* 2x2 Grid for 4 Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {memberList.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl bg-slate-950/90 border transition-all ${
                  idx === 0
                    ? 'border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.12)]'
                    : 'border-slate-800/90'
                }`}
              >
                {/* Header: Member Index & Name + RegNo */}
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-900">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-black text-white uppercase truncate">
                      {idx + 1}. {m.name || `Member ${idx + 1}`}
                    </span>
                    {idx === 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-extrabold text-[8px] uppercase border border-cyan-400/30 shrink-0">
                        TEAM LEAD
                      </span>
                    )}
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-[10px] font-mono font-black text-sky-300 border border-sky-400/30 shrink-0">
                    {m.regNo || 'N/A'}
                  </span>
                </div>

                {/* Body Details: Dept, Year, Mobile, Accomm */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 text-[10px] text-slate-300">
                  <div>
                    <span className="text-slate-400">Dept: </span>
                    <strong className="text-white uppercase">{m.department || 'CSE'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Year: </span>
                    <strong className="text-white uppercase">{m.year || 'III'} {m.section ? `(${m.section})` : ''}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Mobile: </span>
                    <strong className="text-white font-mono">{m.mobile || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Accomm: </span>
                    <strong className="text-cyan-300">
                      {m.accommodation === 'Hosteller' ? `Hosteller ${m.hostel ? `(${m.hostel}${m.roomNumber ? ` - Rm ${m.roomNumber}` : ''})` : ''}` : 'Day Scholar'}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Bottom Official Verified Footer */}
        <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-extrabold tracking-widest text-slate-400 uppercase font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>OFFICIAL VERIFIED BADGE • KARE IEEE EDUCATION SOCIETY 2026</span>
          </div>
          <div className="text-slate-400">
            PASS ID: <span className="text-cyan-300">{teamId}</span> • 2-CREDIT COMPLIANT
          </div>
        </div>

      </div>
    </div>
  );
};
