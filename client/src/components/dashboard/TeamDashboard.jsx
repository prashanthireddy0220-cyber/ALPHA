import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Clock, CheckCircle, XCircle, AlertCircle, Users, ExternalLink, Download, Flame, HelpCircle, Send, MessageCircle } from 'lucide-react';
import { AnnouncementCard } from './AnnouncementCard';
import { TiltCard } from '../common/TiltCard';
import { useAuth } from '../../contexts/AuthContext';

export const TeamDashboard = () => {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Help Request Modal
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpCategory, setHelpCategory] = useState('Technical Issue');
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSuccess, setHelpSuccess] = useState('');

  const fetchTeamData = async () => {
    // Instant 0ms cached load from sessionStorage for high-speed dashboard opening
    const cacheKey = 'alpha_cached_team_dashboard';
    const cached = sessionStorage.getItem(cacheKey);
    let hasCache = false;

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.team) {
          setData(parsed);
          setLoading(false);
          hasCache = true;
        }
      } catch (e) {}
    }

    try {
      const res = await axios.get('/api/registration/my-team');
      setData(res.data);
      sessionStorage.setItem(cacheKey, JSON.stringify(res.data));

      if (res.data.team?.teamId && user && (!user.teamId || user.teamId !== res.data.team.teamId)) {
        const updatedUser = { ...user, teamId: res.data.team.teamId };
        setUser(updatedUser);
        localStorage.setItem('alpha_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      if (!hasCache) {
        setError(err.response?.data?.message || 'No team found for your account.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleHelpSubmit = async (e) => {
    e.preventDefault();
    if (!helpMessage.trim()) return;
    try {
      await axios.post('/api/help/request', {
        category: helpCategory,
        message: helpMessage
      });
      setHelpSuccess('Help request submitted! A volunteer will assist your team shortly.');
      setHelpMessage('');
      setTimeout(() => setHelpSuccess(''), 4000);
    } catch (err) {
      alert('Failed to submit help request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-sky-400 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-sky-300 tracking-widest uppercase">INITIALIZING PARTICIPANT DASHBOARD...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.team) {
    return (
      <div className="min-h-screen pt-36 px-4 max-w-md mx-auto text-center">
        <TiltCard className="p-8 md:p-10 rounded-3xl glass-card border border-sky-500/30 bg-slate-950/90 shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col items-center justify-center">
          <div className="relative p-1.5 rounded-full bg-sky-500/10 border border-sky-400/40 shadow-[0_0_25px_rgba(0,240,255,0.4)] mb-4">
            <img src="/assets/kare_logo.jpg" alt="KARE IEEE" className="w-12 h-12 rounded-full object-contain" />
          </div>
          <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-widest mb-1">
            PARTICIPANT DASHBOARD
          </span>
          <h2 className="text-lg font-black text-white uppercase tracking-wide mb-2">
            NO REGISTERED TEAM FOUND
          </h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Logged in as <strong className="text-cyan-300 font-mono">{user?.email || user?.name || 'Participant'}</strong>. Register your team to claim your spot and generate your official ALPHA Event Pass.
          </p>

          <div className="w-full space-y-3">
            <Link
              to="/register"
              className="w-full py-3.5 px-6 text-xs font-black tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all uppercase inline-block text-center"
            >
              REGISTER YOUR TEAM NOW
            </Link>
            <button
              onClick={() => fetchTeamData()}
              className="w-full py-3 px-6 text-xs font-bold tracking-wider text-sky-300 glass-button rounded-2xl transition-all"
            >
              RE-CHECK FOR REGISTERED PASS
            </button>
          </div>
        </TiltCard>
      </div>
    );
  }

  const { team, eventSettings } = data;
  const payment = team.payment || {};

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
      {/* ⭐ Prominent Liquid Glass Dashboard Announcement Box */}
      <AnnouncementCard />

      {/* 1. TEAM STATUS BANNER */}
      <div
        className={`p-6 rounded-3xl glass-card border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl ${
          payment.status === 'VERIFIED'
            ? 'border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
            : payment.status === 'REJECTED'
            ? 'border-red-500/50 bg-red-950/20'
            : 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
        }`}
      >
        <div className="flex items-center gap-4">
          {payment.status === 'VERIFIED' ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
              <CheckCircle className="w-8 h-8" />
            </div>
          ) : payment.status === 'REJECTED' ? (
            <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-400/40">
              <XCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
          )}

          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
              OFFICIAL TEAM REGISTRATION STATUS
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white">{team.teamName}</h1>
            <span
              className={`text-xs font-extrabold tracking-wider ${
                payment.status === 'VERIFIED'
                  ? 'text-emerald-300'
                  : payment.status === 'REJECTED'
                  ? 'text-red-300'
                  : 'text-amber-300'
              }`}
            >
              STATUS: {payment.status === 'VERIFIED' ? 'VERIFIED & LOCKED ✓' : payment.status || 'PENDING VERIFICATION'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ASSIGNED TEAM ID</span>
            <span className="text-2xl font-black text-cyan-300 font-mono text-glow">{team.teamId}</span>
          </div>
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-3 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 transition-all"
            title="Request Assistance"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

      {payment.status === 'REJECTED' && payment.rejectionReason && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-semibold">
          Rejection Reason: {payment.rejectionReason}
        </div>
      )}

      {/* ⭐ OFFICIAL WHATSAPP GROUP & TEAMMATES JOIN NOTICE */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-start gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0 mt-0.5">
            <MessageCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black text-white uppercase tracking-wider">OFFICIAL PARTICIPANTS WHATSAPP GROUP</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[9px] text-emerald-300 font-extrabold border border-emerald-400/30">MANDATORY</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Join the official WhatsApp group for live hackathon announcements, reporting schedules, and mentor coordination.
              <br />
              <strong className="text-emerald-300 font-bold">👉 Please share this invitation link with all your teammates ({team.members?.map(m => m.name).join(', ')}) and ensure everyone is added!</strong>
            </p>
          </div>
        </div>
        <a
          href={eventSettings?.communityLink || 'https://chat.whatsapp.com/KQgGm91cXyS1WiZC8nVyls'}
          target="_blank"
          rel="noreferrer"
          className="w-full md:w-auto px-7 py-4 text-xs font-black text-black bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.5)] text-center flex items-center justify-center gap-2 shrink-0 transition-all uppercase cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span>JOIN WHATSAPP GROUP</span>
        </a>
      </div>

      {/* 2. OFFICIAL EVENT PASS CARD */}
      <TiltCard className="p-6 md:p-8 border border-sky-400/40 relative overflow-hidden bg-slate-950/80 shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        {/* Pass Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-sky-500/10 border border-sky-400/30">
              <img src="/assets/kare_logo.jpg" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs md:text-sm font-black text-white tracking-widest uppercase">ALPHA 2026 OFFICIAL PASS</h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-400/30">
                  {payment.status === 'VERIFIED' ? 'ADMISSION CONFIRMED' : 'PAYMENT PENDING'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">KARE IEEE Education Society Student Branch</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD PASS (PDF)</span>
            </button>
          </div>
        </div>

        {/* Pass Core Body: Team & Lead Info + QR Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 items-center">
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-0.5">TEAM NAME</span>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase text-glow">{team.teamName}</h3>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">TEAM LEAD</span>
                <span className="font-bold text-cyan-300 uppercase">
                  {team.members?.[0]?.name || 'LEAD'} ({team.leadEmail || team.members?.[0]?.email})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">ASSIGNED TEAM ID</span>
                <span className="text-xl font-black text-cyan-400 font-mono tracking-wider">{team.teamId}</span>
              </div>
            </div>
          </div>

          {/* Embedded Real QR Code Verification */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-sky-500/30 shadow-inner">
            <div className="p-2 bg-white rounded-xl shadow-lg mb-2">
              <QRCodeSVG value={`https://alpha-ieee-eds.vercel.app/verify/${team.teamId}`} size={110} />
            </div>
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider font-mono">SCAN TO VERIFY</span>
          </div>
        </div>

        {/* Event Meta Grid */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">EVENT VENUE</span>
            <span className="font-bold text-white">{eventSettings?.venue || 'KARE Auditorium & CSE Tech Arena'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">REPORTING TIME / DATE</span>
            <span className="font-bold text-cyan-300">{eventSettings?.eventDate || 'OCTOBER 1 - 2, 2026'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">PAYMENT REF (UTR)</span>
            <span className="font-mono font-bold text-slate-200">{payment.utr || 'N/A'}</span>
          </div>
        </div>

        {/* Team Participants Cards List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>TEAM PARTICIPANTS ({team.members?.length || 0} MEMBERS)</span>
            </span>
            <span className="text-[10px] text-cyan-300 font-semibold uppercase">TRACK: {team.track || 'AI & ML'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {team.members?.map((m, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-white uppercase flex items-center gap-2">
                    <span>{i + 1}. {m.name}</span>
                    {i === 0 && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[9px] text-cyan-300 font-extrabold border border-cyan-400/30 uppercase">
                        TEAM LEAD
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-[10px] text-sky-300 font-mono font-bold border border-sky-500/30">
                    {m.regNo}
                  </span>
                </div>

                <div className="text-slate-400 text-[11px] flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-slate-900">
                  <span>Dept: <strong className="text-slate-200">{m.department || 'CSE'}</strong></span>
                  <span>Year: <strong className="text-slate-200">{m.year || 'II'} ({m.section || 'A'})</strong></span>
                  <span>Mobile: <strong className="text-slate-200">{m.mobile || 'N/A'}</strong></span>
                </div>

                <div className="text-[10px] text-slate-400">
                  <span>Accommodation: <strong className="text-cyan-300">{m.accommodation || 'Day Scholar'}</strong></span>
                  {m.accommodation === 'Hosteller' && m.hostel && (
                    <span className="ml-2 text-slate-300">({m.hostel} - Rm {m.roomNumber || 'N/A'})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Notice */}
        <div className="pt-4 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 font-semibold uppercase">
          <span>OFFICIAL VERIFIED BADGE — KARE IEEE HACKATHON 2026</span>
          <a
            href={eventSettings?.communityLink || 'https://chat.whatsapp.com/KQgGm91cXyS1WiZC8nVyls'}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-300 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>JOIN WHATSAPP COMMUNITY</span>
          </a>
          <span>NOTE: 2EE CREDITS COMPLIANT</span>
        </div>
      </TiltCard>

      {/* 3. EVENT INFORMATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TiltCard className="p-6 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">EVENT DATE</span>
          <span className="text-base font-bold text-white">{eventSettings?.eventDate || 'MARCH 28 - 29, 2026'}</span>
        </TiltCard>

        <TiltCard className="p-6 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">VENUE</span>
          <span className="text-xs font-bold text-slate-200">{eventSettings?.venue || 'KARE Auditorium & CSE Arena'}</span>
        </TiltCard>

        <TiltCard className="p-6 text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">ACADEMIC CREDITS</span>
          <span className="text-base font-bold text-cyan-300">{eventSettings?.academicCredits || '2EE Credits'}</span>
        </TiltCard>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-sky-500/40 relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span>REQUEST VOLUNTEER ASSISTANCE</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Submit a help ticket directly to venue volunteers</p>

            {helpSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                {helpSuccess}
              </div>
            )}

            <form onSubmit={handleHelpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">CATEGORY</label>
                <select
                  value={helpCategory}
                  onChange={(e) => setHelpCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Food">Food / Refreshments</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Payment">Payment Verification</option>
                  <option value="Venue">Venue Navigation</option>
                  <option value="Other">Other Query</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">DESCRIPTION *</label>
                <textarea
                  required
                  rows={3}
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  placeholder="Describe what help your team needs..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="w-1/3 py-2.5 text-xs font-bold text-slate-400 glass-card rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 text-xs font-bold text-black bg-cyan-300 hover:bg-cyan-200 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SUBMIT HELP TICKET</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
