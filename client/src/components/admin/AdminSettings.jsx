import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, Lock, Unlock, CheckCircle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { TiltCard } from '../common/TiltCard';

export const AdminSettings = () => {
  const { settings, fetchSettings } = useSettings();
  const [form, setForm] = useState({ ...settings });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    try {
      await axios.put('/api/settings', form);
      fetchSettings();
      setSuccessMessage('Event settings updated successfully!');
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">EVENT & REGISTRATION SETTINGS</h1>
        <p className="text-xs text-slate-400">Manage live capacity, pricing, UPI IDs, and registration toggles</p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Registration Toggle Box */}
        <TiltCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {form.registrationOpen ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-red-400" />}
                <span>REGISTRATION STATUS</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {form.registrationOpen ? 'Registrations are LIVE and accepting teams.' : 'Registrations are CLOSED. API & UI will reject new submissions.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleChange('registrationOpen', !form.registrationOpen)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
                form.registrationOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
              }`}
            >
              {form.registrationOpen ? 'CLOSE REGISTRATION' : 'OPEN REGISTRATION'}
            </button>
          </div>
        </TiltCard>

        <TiltCard className="p-6">
          <h2 className="text-base font-bold text-white mb-4">CAPACITY & PRICING CONFIGURATION</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">MAXIMUM TEAMS LIMIT *</label>
              <input
                type="number"
                value={form.maxTeams || 100}
                onChange={(e) => handleChange('maxTeams', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">TEAM SIZE *</label>
              <input
                type="number"
                value={form.teamSize || 4}
                onChange={(e) => handleChange('teamSize', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">FEE PER MEMBER (₹) *</label>
              <input
                type="number"
                value={form.participantFee || 350}
                onChange={(e) => handleChange('participantFee', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-bold"
              />
            </div>
          </div>
        </TiltCard>

        <TiltCard className="p-6">
          <h2 className="text-base font-bold text-white mb-4">PAYMENT & COMMUNITY DETAILS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">UPI ID *</label>
              <input
                type="text"
                value={form.upiId || 'kareieee@upi'}
                onChange={(e) => handleChange('upiId', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">WHATSAPP COMMUNITY LINK *</label>
              <input
                type="text"
                value={form.communityLink || ''}
                onChange={(e) => handleChange('communityLink', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">EVENT DATE *</label>
              <input
                type="text"
                value={form.eventDate || ''}
                onChange={(e) => handleChange('eventDate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">VENUE *</label>
              <input
                type="text"
                value={form.venue || ''}
                onChange={(e) => handleChange('venue', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>
        </TiltCard>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-xs font-extrabold tracking-widest text-black bg-cyan-300 hover:bg-cyan-200 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'SAVING SETTINGS...' : 'SAVE EVENT SETTINGS'}</span>
        </button>
      </form>
    </div>
  );
};
