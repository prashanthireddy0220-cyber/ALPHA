import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Camera, CheckCircle, AlertTriangle, ShieldCheck, LogOut, RefreshCw, Users, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AttendanceScanner } from '../components/attendance/AttendanceScanner';
import { TiltCard } from '../components/common/TiltCard';

export const VolunteerAttendancePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveSession = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get('/api/attendance/sessions');
      const sessions = res.data || [];
      // Find open session
      const openSess = sessions.find(s => s.status === 'OPEN');
      setActiveSession(openSess || null);
    } catch (err) {
      console.error('Failed to load active session:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/attendance/login');
      return;
    }
    if (user.role !== 'volunteer' && user.role !== 'admin') {
      navigate('/attendance/login');
      return;
    }

    fetchActiveSession();

    // Polling every 4 seconds to detect if Admin closes session live
    const interval = setInterval(() => {
      fetchActiveSession();
    }, 4000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-[#020617] text-slate-300">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
        <p className="text-xs font-bold tracking-widest uppercase">Checking Attendance Status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="rounded-3xl glass-card border border-sky-500/30 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950/80 shadow-[0_0_40px_rgba(0,240,255,0.15)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-bold text-cyan-300 uppercase tracking-widest mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>VOLUNTEER ATTENDANCE PORTAL</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <span>Welcome, {user?.name || 'Volunteer'}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 font-semibold font-mono">
              {user?.volunteerId || user?.role?.toUpperCase()}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={fetchActiveSession}
            disabled={refreshing}
            className="p-2.5 rounded-xl glass-button text-slate-300 hover:text-white"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/attendance/login');
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 1. DISABLED VOLUNTEER PERMISSION WARNING */}
      {user?.role === 'volunteer' && (user?.attendancePermission === false || user?.status === 'disabled') && (
        <TiltCard className="p-8 md:p-12 text-center rounded-3xl glass-card border border-red-500/40 bg-slate-950/90 shadow-[0_0_50px_rgba(239,68,68,0.15)] space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-400/40 text-red-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-black text-red-400 uppercase tracking-wider text-glow">
              ⚠️ ATTENDANCE PERMISSION DISABLED
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto mt-3 leading-relaxed font-light">
              Your attendance scanning permission has been disabled or suspended by the Event Administrator.
              Please contact the Admin team from the Control Center to re-enable your attendance scanning privileges.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>VOLUNTEER ID:</span>
              <span className="text-white font-mono font-bold">{user.volunteerId || user.email}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>PERMISSION STATUS:</span>
              <span className="text-red-400 font-bold">DISABLED BY ADMIN ✕</span>
            </div>
          </div>
        </TiltCard>
      )}

      {/* 2. CLOSED SESSION EXPERIENCE CARD */}
      {(user?.role !== 'volunteer' || (user?.attendancePermission !== false && user?.status !== 'disabled')) && !activeSession && (
        <TiltCard className="p-8 md:p-12 text-center rounded-3xl glass-card border border-amber-500/40 bg-slate-950/90 shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse">
            <Lock className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-black text-amber-300 uppercase tracking-wider text-glow">
              🔒 ATTENDANCE IS CURRENTLY CLOSED
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto mt-3 leading-relaxed font-light">
              Attendance has not been opened by the Event Administrator.
              Please wait until the administrator opens an attendance session from the Admin Control Center.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>SCANNING STATUS:</span>
              <span className="text-amber-400 font-bold">LOCKED</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>MANUAL ENTRY:</span>
              <span className="text-amber-400 font-bold">DISABLED</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>PERMISSION CHECK:</span>
              <span className="text-emerald-400 font-bold">VOLUNTEER VERIFIED</span>
            </div>
          </div>
        </TiltCard>
      )}

      {/* ACTIVE OPEN ATTENDANCE SESSION */}
      {activeSession && (user?.role !== 'volunteer' || (user?.attendancePermission !== false && user?.status !== 'disabled')) && (
        <div className="space-y-6">
          {/* Active Session Status Banner */}
          <div className="p-4 rounded-2xl glass-card border border-emerald-500/50 bg-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">ACTIVE SESSION</span>
                <h3 className="text-base font-black text-white">{activeSession.name} ({activeSession.date})</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">PRESENT COUNT</span>
                <span className="font-mono font-black text-emerald-300 text-sm">{activeSession.presentCount || 0} / {activeSession.expectedParticipants || 250}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold">
                🟢 OPEN
              </span>
            </div>
          </div>

          {/* Scanner Component */}
          <AttendanceScanner activeSession={activeSession} />
        </div>
      )}

    </div>
  );
};
