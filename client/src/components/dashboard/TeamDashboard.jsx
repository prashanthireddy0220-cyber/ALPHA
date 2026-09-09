import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Clock, CheckCircle, XCircle, AlertCircle, Users, ExternalLink, Download, Flame, HelpCircle, Send } from 'lucide-react';
import { AnnouncementCard } from './AnnouncementCard';
import { TiltCard } from '../common/TiltCard';

export const TeamDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Help Request Modal
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpCategory, setHelpCategory] = useState('Technical Issue');
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSuccess, setHelpSuccess] = useState('');

  const fetchTeamData = async () => {
    try {
      const res = await axios.get('/api/registration/my-team');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No team found for your account.');
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
          <a
            href="/register"
            className="w-full py-4 px-6 text-xs font-black tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all uppercase tracking-wider inline-block cursor-pointer"
          >
            REGISTER A TEAM NOW
          </a>
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

      {/* 2. OFFICIAL EVENT PASS CARD */}
      <TiltCard className="p-8 border border-sky-400/40 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img src="/assets/kare_logo.jpg" alt="Logo" className="w-12 h-12 rounded-full" />
            <div>
              <h2 className="text-sm font-black text-white tracking-widest">KARE IEEE EDUCATION SOCIETY</h2>
              <span className="text-xs font-bold text-sky-400">OFFICIAL EVENT PASS — {team.teamId}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl shadow-2xl">
            <QRCodeSVG value={`https://alpha-hackathon.klu.ac.in/verify/${team.teamId}`} size={120} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">TEAM NAME</span>
            <span className="text-base font-bold text-white">{team.teamName}</span>
            <span className="text-slate-400 block mt-2">Lead Email: {team.leadEmail}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block mb-1">TEAM MEMBERS</span>
            <div className="space-y-1">
              {team.members?.map((m, i) => (
                <div key={i} className="p-2 rounded bg-slate-950 text-slate-200 border border-slate-800">
                  {i+1}. {m.name} ({m.regNo}) - {m.department} ({m.year} Year)
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href={eventSettings?.communityLink || 'https://chat.whatsapp.com/BST4xC9Kdkc3ccZ30BLWYo'}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>JOIN WHATSAPP COMMUNITY</span>
          </a>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial px-6 py-3 text-xs font-bold text-black bg-cyan-300 hover:bg-cyan-200 rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD PASS (PDF)</span>
            </button>
          </div>
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
