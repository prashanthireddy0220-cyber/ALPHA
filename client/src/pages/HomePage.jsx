import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { CapacityDisplay } from '../components/sections/CapacityDisplay';
import { EventBreakdownSection } from '../components/sections/EventBreakdownSection';
import { PrizePoolSection } from '../components/sections/PrizePoolSection';
import { TimelineSection } from '../components/sections/TimelineSection';
import { RulesSection } from '../components/sections/RulesSection';
import { Footer } from '../components/common/Footer';

export const HomePage = () => {
  return (
    <div className="relative">
      <HeroSection />
      <CapacityDisplay />
      <EventBreakdownSection />
      <PrizePoolSection />
      <TimelineSection />
      <RulesSection />
      <Footer />
    </div>
  );
};

