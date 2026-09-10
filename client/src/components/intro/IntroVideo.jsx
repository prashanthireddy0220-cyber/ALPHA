import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export const IntroVideo = ({ onVideoEnd }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fireBloomRef = useRef(null);
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

    // Safety fallback timer at 4.2s (cuts video cleanly before any end artifact)
    fallbackTimerRef.current = setTimeout(() => {
      triggerEnd();
    }, 4200);

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

  // Lightweight video ended / time update check without React state re-renders
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    // Cut video at 3.8s right before any pause symbol or static end frame
    if (video.currentTime >= 3.8) {
      triggerEnd();
    }
  };

  // Ultra-fast zero-re-render 60FPS Canvas particle & lighting overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 50 lightweight atmospheric fog & cyan fire particles
    const particleCount = window.innerWidth < 768 ? 25 : 50;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      color: Math.random() > 0.3 ? 'rgba(0, 240, 255, ' : 'rgba(255, 255, 255, ',
      opacity: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 1.0 - 0.3
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Read video time directly without React state
      const video = videoRef.current;
      let fireIntensity = 0;
      if (video && video.currentTime >= 1.6 && video.currentTime < 3.8) {
        fireIntensity = Math.min(1, (video.currentTime - 1.6) / 0.8);
      }

      // Update fire bloom overlay directly via DOM ref (0 re-renders)
      if (fireBloomRef.current) {
        fireBloomRef.current.style.opacity = (fireIntensity * 0.45).toString();
      }

      particles.forEach((p) => {
        p.x += p.vx * (1 + fireIntensity * 1.5);
        p.y += p.vy * (1 + fireIntensity * 2.0);

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (1 + fireIntensity * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity * (0.5 + fireIntensity * 0.5)})`;
        ctx.shadowBlur = 10 * (1 + fireIntensity * 1.2);
        ctx.shadowColor = '#00f0ff';
        ctx.fill();
      });

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []); // Run once! Zero re-renders during video playback

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.03 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onClick={triggerEnd}
      className="fixed inset-0 z-50 w-screen h-screen bg-[#020617] overflow-hidden flex items-center justify-center cursor-pointer select-none"
    >
      {/* Responsive Aspect-Fitting Container for Desktop Widescreen & Mobile Portrait */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Main 3D Dragon Intro Video Render */}
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
          className="w-full h-full object-cover object-center pointer-events-none select-none border-none outline-none filter brightness-[1.05] contrast-[1.08] saturate-[1.15]"
          style={{
            outline: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            willChange: 'transform'
          }}
        />

        {/* Scene 3 & 4: Cyan-White Fire Illumination Radial Light Bloom */}
        <div
          ref={fireBloomRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-200 ease-out opacity-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.45) 0%, rgba(14, 165, 233, 0.2) 40%, rgba(2, 6, 23, 0) 75%)',
            mixBlendMode: 'screen'
          }}
        />

        {/* Volumetric Fog & Side Vignette Soft Mask for Seamless Multi-Aspect Framing */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/80 opacity-70 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.85)_100%)] pointer-events-none" />

        {/* Interactive WebGL Fire Embers & Volumetric Particle Overlay */}
        <canvas ref={canvasRef} className="absolute inset-0 opacity-85 pointer-events-none" />
      </div>
    </motion.div>
  );
};





