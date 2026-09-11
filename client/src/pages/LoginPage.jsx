import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TiltCard } from '../components/common/TiltCard';

export const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // If already logged in, automatically redirect to Dashboard or Landing Page
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.teamId) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async (preferRedirect = false) => {
    setError('');
    setLoading(true);
    try {
      const result = await loginWithGoogle(preferRedirect);
      if (result?.redirecting) {
        // Browser will navigate to Google Sign-In
        return;
      }
      setLoading(false);
      if (result.success) {
        navigate(result.user?.teamId ? '/dashboard' : '/register');
      } else {
        setError(result.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to sign in with Google. Please try again.');
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
              Sign in with your verified KLU Google account (@klu.ac.in) to register your team & access your event pass.
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
            onClick={() => handleGoogleSignIn(false)}
            disabled={loading}
            className="w-full py-4 px-4 text-xs font-extrabold tracking-wider text-white bg-slate-900/90 hover:bg-slate-800 border border-sky-500/40 rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-3 group cursor-pointer relative z-30 pointer-events-auto"
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
            <span>{loading ? 'CONNECTING TO GOOGLE...' : 'SIGN IN WITH GOOGLE'}</span>
          </button>

          {/* Fallback for strict browsers or blocked popups */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => handleGoogleSignIn(true)}
              disabled={loading}
              className="text-[11px] text-sky-400/80 hover:text-sky-300 underline underline-offset-4 transition-colors"
            >
              Popups blocked? Click here to sign in via full redirect
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400">
              Only official KLU student email IDs (<strong className="text-cyan-300 font-mono">@klu.ac.in</strong>) are authorized to participate.
            </p>
          </div>
        </TiltCard>
      </div>
    </div>
  );
};
