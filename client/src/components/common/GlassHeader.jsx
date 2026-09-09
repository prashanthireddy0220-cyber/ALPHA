import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, Ticket, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const GlassHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Event Details', path: '/event-details' },
  ];

  const handleNavClick = (link) => {
    setMobileOpen(false);
  };

  const isActive = (link) => {
    if (link.path === '/') return location.pathname === '/' && !location.hash;
    return location.pathname === link.path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 md:px-8">
      <div className="mx-auto max-w-7xl rounded-full glass-card border border-sky-500/30 px-5 py-2.5 flex items-center justify-between shadow-[0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-xl bg-slate-950/80">
        
        {/* LEFT: ALPHA / KARE IEEE Education Society Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative p-1 rounded-full bg-sky-500/10 border border-sky-400/30 group-hover:border-sky-400 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all">
            <img
              src="/assets/kare_logo.jpg"
              alt="KARE IEEE Education Society Logo"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-contain"
            />
          </div>
          <div>
            <div className="text-xs md:text-sm font-black tracking-widest text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
              <span>ALPHA</span>
            </div>
            <p className="text-[9px] text-slate-400 tracking-wider hidden sm:block font-medium">KARE IEEE Education Society</p>
          </div>
        </Link>

        {/* NAVIGATION: Home | Event Details */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => handleNavClick(link)}
              className={`px-4 py-1.5 text-xs font-bold tracking-wider rounded-full transition-all ${
                isActive(link)
                  ? 'text-sky-300 bg-sky-500/20 border border-sky-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT: Login | My Event Pass */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'volunteer' ? '/attendance' : '/dashboard'}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-sky-300 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all transform hover:-translate-y-0.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>MY EVENT PASS</span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors glass-button rounded-full"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>LOGIN</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold tracking-wider text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all transform hover:-translate-y-0.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>MY EVENT PASS</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-full glass-card border border-sky-500/30"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-3 rounded-2xl glass-card p-4 border border-sky-500/30 shadow-2xl flex flex-col gap-2 bg-slate-950/95 backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => handleNavClick(link)}
              className={`px-4 py-2.5 text-sm font-bold tracking-wider rounded-xl transition-all ${
                isActive(link)
                  ? 'text-sky-300 bg-sky-500/20 border border-sky-400/40'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2 mt-1">
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'volunteer' ? '/attendance' : '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-xs font-bold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>MY EVENT PASS</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-center px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white glass-button rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>LOGIN</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-xs font-bold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>MY EVENT PASS</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


