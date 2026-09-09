import React, { useEffect, useState } from 'react';

export const CursorLight = () => {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleTouch = () => setIsMobile(true);
    if ('ontouchstart' in window) setIsMobile(true);

    const handleMouseMove = (e) => {
      if (!isMobile) {
        setPos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-70"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(0, 240, 255, 0.08), rgba(15, 23, 42, 0) 70%)`
      }}
    />
  );
};
