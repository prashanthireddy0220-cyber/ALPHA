import React, { useEffect, useRef, useState } from 'react';

export const GlobalDragonBackground = () => {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const targetParallax = useRef({ x: 0, y: 0 });
  const currentParallax = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch / mobile devices to disable cursor parallax
    const checkTouch = () => {
      const isTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(isTouch);
    };
    checkTouch();

    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // Calculate normalized position -1 to 1
      const normX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const normY = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      // Dragon moves slightly in opposite direction (-18px max X, -12px max Y)
      targetParallax.current = {
        x: normX * -18,
        y: normY * -12
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth LERP loop for fluid parallax movement
    let rafId;
    const updateParallax = () => {
      currentParallax.current.x += (targetParallax.current.x - currentParallax.current.x) * 0.06;
      currentParallax.current.y += (targetParallax.current.y - currentParallax.current.y) * 0.06;

      setParallax({
        x: currentParallax.current.x,
        y: currentParallax.current.y
      });

      rafId = requestAnimationFrame(updateParallax);
    };

    rafId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isTouchDevice]);

  // Atmospheric Fog & Particle Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = prefersReduced ? 12 : window.innerWidth < 768 ? 20 : 40;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cyan/steel blue particles drifting through mist
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 0.5,
      color: Math.random() > 0.4 ? 'rgba(56, 189, 248, ' : 'rgba(0, 240, 255, ',
      opacity: Math.random() * 0.5 + 0.15,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.6 - 0.15,
      pulse: Math.random() * Math.PI * 2
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.05, Math.min(0.8, currentOpacity))})`;
        ctx.shadowBlur = 8;
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
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#020617]">
      {/* Layer 1: Dark Atmospheric Base Gradient */}
      <div className="absolute inset-0 bg-[#020617]" />

      {/* Layer 2: Electric Cyan Ambient Lighting Glow Behind Dragon Head */}
      <div className="absolute top-1/3 left-1/4 w-[50vw] h-[50vh] bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.2)_0%,rgba(15,23,42,0)_70%)] opacity-90 pointer-events-none" />

      {/* Layer 3: Main Widescreen Blue Dragon Background Image (Dragon Head Left, Castle Right) */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out flex items-center justify-center"
        style={{
          transform: isTouchDevice
            ? 'none'
            : `translate3d(${parallax.x}px, ${parallax.y}px, 0)`
        }}
      >
        <div className="relative w-full h-full animate-dragon-float flex items-center justify-center overflow-hidden">
          <img
            src="/assets/blue_dragon_bg.jpg"
            alt="Global Blue Dragon Atmosphere"
            className="w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.1] saturate-[1.15] scale-105 transition-all duration-700"
          />
        </div>
      </div>

      {/* Layer 4: Center Dark Vignette for Text & Card Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 via-transparent to-[#020617]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.35)_0%,rgba(2,6,23,0.75)_90%)] pointer-events-none" />

      {/* Layer 5: Moving Atmospheric Smoke / Mist Overlay */}
      <div
        className="absolute inset-0 animate-smoke-drift mix-blend-screen opacity-50 pointer-events-none"
        style={{
          transform: isTouchDevice
            ? 'none'
            : `translate3d(${parallax.x * 1.5}px, ${parallax.y * 1.5}px, 0)`
        }}
      >
        <div className="w-full h-full bg-[radial-gradient(circle_at_30%_40%,rgba(56,189,248,0.18)_0%,transparent_60%)]" />
      </div>

      {/* Layer 6: Drifting Cyan Embers Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80 pointer-events-none" />
    </div>
  );
};
