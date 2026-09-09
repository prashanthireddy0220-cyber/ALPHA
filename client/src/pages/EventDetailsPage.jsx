import React, { useEffect } from 'react';
import { EventSpecifications } from '../components/event/EventSpecifications';
import { Footer } from '../components/common/Footer';

export const EventDetailsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 relative pt-20">
      <EventSpecifications />
      <Footer />
    </div>
  );
};
