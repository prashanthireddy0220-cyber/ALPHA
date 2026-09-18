import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Lock, X } from 'lucide-react';

/**
 * DevToolsDeterrent Component
 * 
 * Intercepts inspect shortcuts & right-clicks, displaying a stylish popup alert:
 * "Developer settings turned off by the admin"
 */
export const DevToolsDeterrent = () => {
  const [showToast, setShowToast] = useState(false);
  const timeoutRef = useRef(null);

  const triggerAlert = () => {
    setShowToast(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  useEffect(() => {
    // Prevent right-click context menu and show deterrent toast
    const handleContextMenu = (e) => {
      const tagName = e.target?.tagName?.toLowerCase();
      // Allow right-click on input/textarea fields for copy/paste
      if (tagName === 'input' || tagName === 'textarea') {
        return;
      }
      e.preventDefault();
      triggerAlert();
    };

    // Intercept common DevTools shortcut keys (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const key = e.key ? e.key.toUpperCase() : '';
      const keyCode = e.keyCode;

      // F12 Key
      if (key === 'F12' || keyCode === 123) {
        e.preventDefault();
        triggerAlert();
        return false;
      }

      // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
      if (isCmdOrCtrl && isShift && (key === 'I' || key === 'J' || key === 'C' || keyCode === 73 || keyCode === 74 || keyCode === 67)) {
        e.preventDefault();
        triggerAlert();
        return false;
      }

      // Ctrl+U / Cmd+U (View Page Source)
      if (isCmdOrCtrl && (key === 'U' || keyCode === 85)) {
        e.preventDefault();
        triggerAlert();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!showToast) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] max-w-md w-[90%] pointer-events-auto animate-bounce-short">
      <div className="p-4 rounded-2xl bg-slate-950/95 border border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.35)] backdrop-blur-2xl flex items-center justify-between gap-3.5 text-left text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider uppercase text-red-400">ACCESS RESTRICTED</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">ADMIN POLICY</span>
            </div>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">
              Developer settings turned off by the admin
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowToast(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
