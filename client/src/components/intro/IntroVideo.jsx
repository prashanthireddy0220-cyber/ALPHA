import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export const IntroVideo = ({ onVideoEnd }) => {
  const videoRef = useRef(null);
  const hasTriggeredEndRef = useRef(false);
  const fallbackTimerRef = useRef(null);

  const triggerEnd = () => {
    if (hasTriggeredEndRef.current) return;
    hasTriggeredEndRef.current = true;
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    onVideoEnd();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safety fallback timer at 12s in case video hangs
    fallbackTimerRef.current = setTimeout(() => {
      triggerEnd();
    }, 12000);

    // Smooth autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay prevented or video delayed:', err);
      });
    }

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      // Dynamic fallback set slightly past video duration
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = setTimeout(() => {
        triggerEnd();
      }, (video.duration + 0.5) * 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(16px)' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onClick={triggerEnd}
      className="fixed inset-0 z-50 w-screen h-screen bg-black overflow-hidden flex items-center justify-center cursor-pointer select-none"
    >
      <video
        ref={videoRef}
        src="/assets/dragon_intro.mp4"
        autoPlay
        playsInline
        webkit-playsinline="true"
        muted
        loop={false}
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={triggerEnd}
        onError={triggerEnd}
        className="w-full h-full object-cover md:object-cover pointer-events-none select-none border-none outline-none"
        style={{
          outline: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none'
        }}
      />

      {/* Floating Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerEnd();
        }}
        className="absolute bottom-8 right-8 z-50 px-5 py-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer flex items-center gap-2"
      >
        <span>SKIP INTRO</span>
        <span>⏩</span>
      </button>
    </motion.div>
  );
};



