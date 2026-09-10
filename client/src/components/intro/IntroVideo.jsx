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

    // Safety fallback timer at 4.2s (cuts video cleanly before any pause symbol)
    fallbackTimerRef.current = setTimeout(() => {
      triggerEnd();
    }, 4200);

    // Attempt video playback smoothly
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay prevented or video load delayed:', err);
      });
    }

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      // Cut video at 3.8s right before any pause frame appears in video stream
      if (video.currentTime >= 3.8) {
        triggerEnd();
      }
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
        onEnded={triggerEnd}
        onTimeUpdate={handleTimeUpdate}
        onError={triggerEnd}
        onStalled={triggerEnd}
        className="w-full h-full object-cover md:object-cover pointer-events-none select-none border-none outline-none"
        style={{
          outline: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none'
        }}
      />
    </motion.div>
  );
};


