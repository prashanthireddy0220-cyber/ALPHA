import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { EventBreakdownSection } from '../components/sections/EventBreakdownSection';
import { PrizePoolSection } from '../components/sections/PrizePoolSection';
import { RulesSection } from '../components/sections/RulesSection';
import { Footer } from '../components/common/Footer';

export const HomePage = () => {
  return (
    <div className="relative">
      <HeroSection />
      <EventBreakdownSection />
      <PrizePoolSection />
      <RulesSection />
      <Footer />
    </div>
  );
};
