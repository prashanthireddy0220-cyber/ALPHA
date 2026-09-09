import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/admin/AdminLayout';
import { TiltCard } from '../components/common/TiltCard';

export const AdminPage = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already authenticated as admin, render Admin Management Dashboard
  if (user && user.role === 'admin') {
    return (
      <div className="relative">
        <AdminLayout />
      </div>
    );
  }

  // Dedicated Admin Login Handler (Password-Only)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login('admin@alpha.klu.ac.in', password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Invalid admin password');
    } else if (result.user && result.user.role !== 'admin') {
      setError('Access denied. This portal is strictly reserved for Admin accounts.');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center bg-transparent relative overflow-hidden">
      {/* Ambient Red/Cyan Admin Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <TiltCard className="p-8 md:p-10 rounded-3xl glass-card border border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.2)] bg-slate-950/90 backdrop-blur-2xl text-center">
          
          {/* Admin Shield Icon & Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-3.5 rounded-full bg-red-500/10 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.4)] mb-3">
              <ShieldAlert className="w-10 h-10 text-red-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-widest text-white">ALPHA</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold">ADMIN</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider mt-1">Management Portal</p>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-black tracking-wider text-white uppercase text-glow">
              ADMINISTRATOR LOGIN
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-light">
              Enter admin security password to access control panel.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                ADMIN PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-900/90 border border-red-500/30 text-white text-xs font-semibold placeholder-slate-600 focus:outline-none focus:border-red-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-xs font-extrabold tracking-widest text-white bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 hover:from-red-500 hover:to-rose-400 rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? 'AUTHENTICATING ADMIN...' : 'ACCESS ADMIN DASHBOARD'}
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        </TiltCard>
      </div>
    </div>
  );
};

