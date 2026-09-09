import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LogoFormation = ({ onComplete }) => {
  // Stage 1: Particles converge to center (0s - 1.2s)
  // Stage 2: Large Club Logo slowly forms & holds at center (1.2s - 4.5s)
  // Stage 3: Smooth fade-out transition into website (4.5s - 5.5s)
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(2), 1200);
    const timer2 = setTimeout(() => setStage(3), 4500);
    const timer3 = setTimeout(() => onComplete(), 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 14,
    distance: 260,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Stage 1: Cyan Particles Converge to Center */}
        {stage === 1 && (
          <div className="relative flex items-center justify-center">
            {particles.map((p) => {
              const rad = (p.angle * Math.PI) / 180;
              const startX = Math.cos(rad) * p.distance;
              const startY = Math.sin(rad) * p.distance;

              return (
                <motion.div
                  key={p.id}
                  initial={{ x: startX, y: startY, opacity: 0, scale: 0.2 }}
                  animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute w-8 h-8 rounded-full bg-cyan-400/40 border border-sky-300 shadow-[0_0_30px_rgba(0,240,255,0.9)]"
                />
              );
            })}
          </div>
        )}

        {/* Stage 2: LARGE Club Logo Slowly & Smoothly Revealed at Center */}
        {stage === 2 && (
          <motion.div
            key="logo-large-center"
            initial={{ scale: 0.65, opacity: 0, filter: 'blur(16px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative p-4 md:p-6 rounded-full bg-gradient-to-tr from-sky-400/30 via-cyan-500/20 to-transparent border-4 border-cyan-300 shadow-[0_0_100px_rgba(0,240,255,0.95)]">
              <img
                src="/assets/kare_logo.jpg"
                alt="KARE IEEE Education Society Logo"
                className="w-64 h-64 md:w-96 md:h-96 rounded-full object-contain drop-shadow-[0_0_35px_rgba(0,240,255,0.8)]"
              />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="mt-8 text-base md:text-xl font-black tracking-widest text-sky-200 uppercase text-glow"
            >
              KARE IEEE EDUCATION SOCIETY
            </motion.p>
          </motion.div>
        )}

        {/* Stage 3: Smooth Cinematic Fade-Out into Website */}
        {stage === 3 && (
          <motion.div
            key="logo-fade-out"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="p-4 md:p-6 rounded-full border-4 border-cyan-300 shadow-[0_0_100px_rgba(0,240,255,0.95)]">
              <img src="/assets/kare_logo.jpg" alt="Logo" className="w-64 h-64 md:w-96 md:h-96 rounded-full object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
