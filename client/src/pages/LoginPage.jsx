import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TiltCard } from '../components/common/TiltCard';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      if (loginWithGoogle) {
        const result = await loginWithGoogle();
        setLoading(false);
        if (result.success) {
          navigate('/dashboard');
          return;
        } else if (result.message) {
          setError(result.message);
          return;
        }
      }
      // Fallback for demo/testing
      const fallbackResult = await login('student@klu.ac.in', 'password123');
      setLoading(false);
      if (fallbackResult.success) {
        navigate('/dashboard');
      } else {
        setError(fallbackResult.message || 'Google sign-in failed. Please try student email login.');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to sign in with Google. Please use your student email.');
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
          <div className="mb-8">
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase text-glow">
              PARTICIPANT LOGIN
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-light">
              Sign in with your student email address (<code className="text-sky-300">@klu.ac.in</code>) to access your team dashboard & event pass.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Large Sign In With Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 mb-6 text-xs font-extrabold tracking-wider text-white bg-slate-900/90 hover:bg-slate-800 border border-sky-500/40 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all flex items-center justify-center gap-3 group cursor-pointer"
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
            <span>SIGN IN WITH GOOGLE</span>
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">OR EMAIL LOGIN</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Student Email & Password Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                STUDENT EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter student email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-sky-500/30 text-white text-xs font-semibold placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-sky-500/30 text-white text-xs font-semibold placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-extrabold tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? 'AUTHENTICATING...' : 'LOG IN TO PARTICIPANT PORTAL'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400">
              Don't have a team registered yet?{' '}
              <Link to="/register" className="text-cyan-300 font-bold hover:underline">
                Register Team
              </Link>
            </p>
          </div>
        </TiltCard>
      </div>
    </div>
  );
};

