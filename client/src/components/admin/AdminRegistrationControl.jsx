import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Lock, Unlock, Users, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { TiltCard } from '../common/TiltCard';

export const AdminRegistrationControl = ({ stats, onRefresh }) => {
  const { settings, fetchSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [maxTeams, setMaxTeams] = useState(settings.maxTeams || 100);
  const [confirmModal, setConfirmModal] = useState(false);

  const isRegistrationOpen = settings.registrationOpen !== false;

  const toggleRegistrationStatus = async () => {
    setLoading(true);
    try {
      await axios.put('/api/settings', {
        registrationOpen: !isRegistrationOpen
      });
      await fetchSettings();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update registration status');
    } finally {
      setLoading(false);
      setConfirmModal(false);
    }
  };

  const handleUpdateCapacity = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/settings', {
        maxTeams: Number(maxTeams)
      });
      await fetchSettings();
      if (onRefresh) onRefresh();
      alert('Registration capacity limit updated successfully');
    } catch (err) {
      alert('Failed to update capacity limit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Registration Status Control Card */}
        <TiltCard className={`p-6 rounded-3xl glass-card border ${isRegistrationOpen ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-red-500/40 bg-red-950/10'} shadow-xl`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">REGISTRATION CONTROL</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isRegistrationOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}>
              {isRegistrationOpen ? '🟢 REGISTRATION OPEN' : '🔴 REGISTRATION CLOSED'}
            </span>
          </div>

          <h2 className="text-xl font-black text-white mb-2">PARTICIPANT REGISTRATION</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Independent administrator control over new participant team registrations. Closing registration blocks new submissions site-wide.
          </p>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 mb-6 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Registered Teams:</span>
              <span className="font-bold text-white">{stats?.totalTeams || 0} / {settings.maxTeams || 100}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Remaining Slots:</span>
              <span className="font-bold text-cyan-300">{Math.max(0, (settings.maxTeams || 100) - (stats?.totalTeams || 0))} Slots</span>
            </div>
          </div>

          <button
            onClick={() => setConfirmModal(true)}
            disabled={loading}
            className={`w-full py-3.5 text-xs font-extrabold tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isRegistrationOpen
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            }`}
          >
            {isRegistrationOpen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>{isRegistrationOpen ? 'CLOSE REGISTRATION' : 'OPEN REGISTRATION'}</span>
          </button>
        </TiltCard>

        {/* Capacity Limit Configuration Card */}
        <TiltCard className="p-6 rounded-3xl glass-card border border-sky-500/30 bg-slate-950/80 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CAPACITY CONFIGURATION</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>

          <h2 className="text-xl font-black text-white mb-2">MAXIMUM TEAM LIMIT</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Configure event registration capacity. Once total claimed slots reach this limit, new registrations will be automatically blocked.
          </p>

          <form onSubmit={handleUpdateCapacity} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                MAXIMUM TEAMS LIMIT
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={maxTeams}
                onChange={(e) => setMaxTeams(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-sky-500/30 text-white font-mono text-sm font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-bold tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>UPDATE REGISTRATION CAPACITY</span>
            </button>
          </form>
        </TiltCard>

      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-sky-500/40 bg-slate-950 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-white uppercase">
              {isRegistrationOpen ? 'CLOSE PARTICIPANT REGISTRATION?' : 'OPEN PARTICIPANT REGISTRATION?'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isRegistrationOpen
                ? 'Are you sure you want to close participant registration? After closing, no new participants will be able to submit team registrations.'
                : 'Are you sure you want to open registration? New team registrations will become active.'}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-300 glass-button rounded-xl"
              >
                CANCEL
              </button>
              <button
                onClick={toggleRegistrationStatus}
                className={`flex-1 py-3 text-xs font-bold rounded-xl text-black ${
                  isRegistrationOpen ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-emerald-400 hover:bg-emerald-300'
                }`}
              >
                CONFIRM & PROCEED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
