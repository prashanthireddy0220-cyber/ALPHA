import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Flame, Lock } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { TiltCard } from '../common/TiltCard';

export const CapacityDisplay = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    totalTeams: 0,
    maxTeams: 60,
    availableSlots: 60,
    registrationOpen: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/registration/capacity-stats');
        setStats(res.data);
      } catch (err) {
        // Fallback gracefully
      }
    };
    fetchStats();
  }, []);

  const totalTeams = typeof stats.totalTeams === 'number' ? stats.totalTeams : 0;
  const maxTeams = settings.maxTeams || stats.maxTeams || 60;
  const availableSlots = Math.max(0, maxTeams - totalTeams);
  
  // Registration status is CLOSED if settings.registrationOpen === false or availableSlots === 0
  const isRegClosed = settings.registrationOpen === false || stats.registrationOpen === false;
  const isFull = availableSlots === 0 || isRegClosed;

  const percent = Math.min(100, Math.round((totalTeams / maxTeams) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      <TiltCard className={`p-8 border shadow-2xl transition-all ${
        isRegClosed
          ? 'border-red-500/40 bg-red-950/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]'
          : 'border-sky-500/30 bg-slate-950/90 shadow-[0_0_50px_rgba(0,240,255,0.15)]'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${
              isRegClosed
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
            }`}>
              <Users className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block">
                LIVE TEAM CAPACITY
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">
                TEAM REGISTRATION STATUS
              </h3>
            </div>
          </div>

          <div className="text-right">
            {isRegClosed ? (
              <span className="px-4 py-2 rounded-xl bg-red-950/90 border border-red-500/60 text-red-300 text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <Lock className="w-4 h-4 text-red-400" /> REGISTRATIONS CLOSED
              </span>
            ) : availableSlots === 0 ? (
              <span className="px-4 py-2 rounded-xl bg-amber-950/90 border border-amber-500/60 text-amber-300 text-xs font-black tracking-widest uppercase flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> CAPACITY FULL
              </span>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Flame className="w-4 h-4 text-emerald-400 animate-pulse" /> {availableSlots} SLOTS REMAINING
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 text-left">
          <div className="flex justify-between text-xs font-extrabold text-slate-300">
            <span>
              CLAIMED SLOTS: <strong className={`${isRegClosed ? 'text-red-400' : 'text-cyan-300'} text-sm font-mono`}>{totalTeams} / {maxTeams} TEAMS</strong>
            </span>
            <span className="text-slate-400">{settings.teamSize || 4} MEMBERS / TEAM</span>
          </div>

          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isRegClosed
                  ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-400'
                  : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </TiltCard>
    </div>
  );
};
