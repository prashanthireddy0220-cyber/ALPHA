import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IntroVideo } from './IntroVideo';
import { LogoFormation } from './LogoFormation';

export const CinematicIntro = ({ onComplete }) => {
  const completedRef = useRef(false);

  const safeComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    sessionStorage.setItem('alpha_intro_played', 'true');
    onComplete();
  };

  useEffect(() => {
    if (sessionStorage.getItem('alpha_intro_played') === 'true') {
      safeComplete();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-black overflow-hidden select-none cursor-pointer"
      onClick={safeComplete}
    >
      <LogoFormation onComplete={safeComplete} />
    </motion.div>
  );
};

