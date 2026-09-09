import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    registrationOpen: true,
    maxTeams: 100,
    teamSize: 4,
    participantFee: 350,
    upiId: 'kareieee@upi',
    eventName: 'ALPHA 2026',
    eventTagline: 'RISE. CONQUER. RULE.',
    eventDate: 'OCTOBER 1 - 2, 2026',
    venue: 'KARE Auditorium & CSE Tech Arena, KLU Campus',
    duration: '24 HOURS',
    prizePool: '₹1,50,000',
    communityLink: 'https://chat.whatsapp.com/alpha-hackathon-2026'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
