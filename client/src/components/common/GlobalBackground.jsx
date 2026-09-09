import React from 'react';

export const GlobalBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-400 selection:text-black overflow-x-hidden">
      {/* Background Image / Ambient Lighting Layer */}
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-black" />
      
      {/* Ambient Gradient Spheres */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Floating Glass Content Container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
