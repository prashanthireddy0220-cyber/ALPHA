import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, CheckCircle, Clock, XCircle, Settings, Megaphone, Flame } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-sky-300 font-bold">LOADING ADMIN METRICS...</div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">ADMIN COMMAND CENTER</h1>
        <p className="text-xs text-slate-400 mt-1">Live metrics and team registration stats</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TiltCard className="p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">TOTAL TEAMS</span>
          <div className="text-3xl font-black text-white mt-1">{stats?.totalTeams || 0}</div>
          <span className="text-[10px] text-sky-400 mt-1 block">Max limit: {stats?.maxTeams || 100}</span>
        </TiltCard>

        <TiltCard className="p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">TOTAL PARTICIPANTS</span>
          <div className="text-3xl font-black text-cyan-300 mt-1 text-glow">{stats?.totalParticipants || 0}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Enrolled students</span>
        </TiltCard>

        <TiltCard className="p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">AVAILABLE SLOTS</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">{stats?.availableSlots || 0}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Active reserves: {stats?.activeReservations || 0}</span>
        </TiltCard>

        <TiltCard className="p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">PENDING PAYMENTS</span>
          <div className="text-3xl font-black text-amber-400 mt-1">{stats?.pendingPayments || 0}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Verified: {stats?.verifiedPayments || 0}</span>
        </TiltCard>
      </div>
    </div>
  );
};
