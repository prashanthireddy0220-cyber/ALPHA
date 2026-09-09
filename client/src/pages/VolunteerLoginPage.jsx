import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, AlertTriangle, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TiltCard } from '../components/common/TiltCard';

export const VolunteerLoginPage = () => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVolunteerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const enteredPasscode = passcode.trim();

    // Authenticate volunteer using passcode
    let result = await login('volunteer@alpha.klu.ac.in', enteredPasscode);

    // Fallback if default passcode 0509 is entered
    if (!result.success && enteredPasscode === '0509') {
      result = await login('volunteer@alpha.klu.ac.in', '0509');
    }

    setLoading(false);

    if (result.success) {
      const user = result.user;
      if (user.role === 'volunteer' || user.role === 'admin') {
        navigate('/attendance');
      } else {
        setError('Access denied. Authorized volunteers only.');
      }
    } else {
      setError(result.message || 'Invalid Volunteer Passcode. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center bg-[#020617] relative overflow-hidden">
      {/* Ambient Cyan Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <TiltCard className="p-8 md:p-10 rounded-3xl glass-card border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.2)] bg-slate-950/90 backdrop-blur-2xl text-center">
          
          {/* Volunteer Camera Icon Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-3.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 shadow-[0_0_30px_rgba(0,240,255,0.4)] mb-3">
              <Camera className="w-9 h-9 text-cyan-300" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-widest text-white">ALPHA</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold">VOLUNTEER</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider mt-1">Attendance Portal</p>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-black tracking-wider text-white uppercase text-glow">
              VOLUNTEER ACCESS
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-light">
              Enter official volunteer passcode to access attendance scanner.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVolunteerLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                VOLUNTEER PASSCODE *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-white text-sm font-semibold placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors tracking-widest font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-extrabold tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? 'VERIFYING PASSCODE...' : 'ACCESS ATTENDANCE PORTAL'}
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        </TiltCard>
      </div>
    </div>
  );
};
