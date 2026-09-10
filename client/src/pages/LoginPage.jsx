import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TiltCard } from '../components/common/TiltCard';

export const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const { loginWithGoogle, login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailInput.trim()) {
      setError('Please enter your KLU Email or Registration Number');
      return;
    }

    setLoading(true);
    try {
      let formattedEmail = emailInput.trim();
      if (!formattedEmail.includes('@')) {
        formattedEmail = `${formattedEmail}@klu.ac.in`;
      }

      const result = await login(formattedEmail, 'password123');
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please verify your details.');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center bg-transparent relative overflow-hidden">
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Main Participant Login Card */}
        <TiltCard className="p-8 md:p-10 rounded-3xl glass-card border border-sky-500/30 shadow-[0_0_50px_rgba(0,240,255,0.2)] bg-slate-950/80 backdrop-blur-2xl text-center">
          
          {/* Organization Logo & Branding */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative p-1.5 rounded-full bg-sky-500/10 border border-sky-400/40 shadow-[0_0_25px_rgba(0,240,255,0.4)] mb-3">
              <img src="/assets/kare_logo.jpg" alt="KARE IEEE Education Society" className="w-14 h-14 rounded-full object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-widest text-white">ALPHA</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold">2026</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wider mt-1">KARE IEEE Education Society</p>
          </div>

          {/* Card Header Title & Description */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase text-glow">
              PARTICIPANT LOGIN
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-light">
              Sign in with your Google account or KLU Email / Registration Number to access registration & your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Single Sign In With Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-4 text-xs font-extrabold tracking-wider text-white bg-slate-900/90 hover:bg-slate-800 border border-sky-500/40 rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-3 group cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'SIGNING IN...' : 'SIGN IN WITH GOOGLE'}</span>
          </button>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
            <span className="relative px-3 bg-[#020617] text-[10px] uppercase tracking-widest text-slate-500 font-semibold">OR</span>
          </div>

          {/* Email / Reg No Form Fallback */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="KLU Email or Reg No (e.g. 2200030100)"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-sky-500/30 text-white text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-xs font-bold tracking-wider text-sky-300 glass-button rounded-xl hover:border-sky-400 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>CONTINUE WITH KLU EMAIL / REG NO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400">
              Sign in above to proceed with team registration & access your event pass.
            </p>
          </div>
        </TiltCard>
      </div>
    </div>
  );
};
