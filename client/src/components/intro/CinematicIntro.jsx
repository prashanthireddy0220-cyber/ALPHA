import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IntroVideo } from './IntroVideo';
import { LogoFormation } from './LogoFormation';

export const CinematicIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState(1);
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

  const handleVideoCompleted = () => {
    setPhase(2);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-black overflow-hidden select-none"
    >
      <AnimatePresence mode="wait">
        {/* Phase 1: Full-Screen Cinematic Intro Video */}
        {phase === 1 && (
          <IntroVideo key="intro-video" onVideoEnd={handleVideoCompleted} />
        )}

        {/* Phase 2: Club Logo Center Formation & Upward Glide to Header */}
        {phase === 2 && (
          <LogoFormation key="logo-formation" onComplete={safeComplete} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

