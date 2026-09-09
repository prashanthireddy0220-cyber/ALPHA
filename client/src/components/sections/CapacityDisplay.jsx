import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Flame, Lock, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { TiltCard } from '../common/TiltCard';

export const CapacityDisplay = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    totalTeams: 87,
    maxTeams: 100,
    availableSlots: 13,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        // Fallback
      }
    };
    fetchStats();
  }, []);

  const totalTeams = stats.totalTeams || 87;
  const maxTeams = settings.maxTeams || 100;
  const availableSlots = Math.max(0, maxTeams - totalTeams);
  const isFull = availableSlots === 0 || settings.registrationOpen === false;

  const percent = Math.min(100, Math.round((totalTeams / maxTeams) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4">
      <TiltCard className="p-8 border border-sky-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block">LIVE TEAM CAPACITY</span>
              <h3 className="text-xl md:text-2xl font-black text-white">TEAM REGISTRATION STATUS</h3>
            </div>
          </div>

          <div className="text-right">
            {isFull ? (
              <span className="px-4 py-2 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-black tracking-widest uppercase flex items-center gap-2">
                <Lock className="w-4 h-4" /> REGISTRATIONS FULL
              </span>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-black tracking-widest uppercase flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400 animate-pulse" /> {availableSlots} SLOTS REMAINING
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-extrabold text-slate-300">
            <span>CLAIMED SLOTS: <strong className="text-cyan-300 text-sm">{totalTeams} / {maxTeams} TEAMS</strong></span>
            <span>{settings.teamSize || 4} MEMBERS / TEAM</span>
          </div>

          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-gradient-to-r from-red-500 to-rose-600'
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
