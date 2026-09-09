import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, AlertCircle, Sparkles, Clock } from 'lucide-react';

export const AnnouncementCard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get('/api/announcements/public');
        setAnnouncements(res.data || []);
      } catch (err) {
        console.error('Failed to load dashboard announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading || announcements.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      {announcements.map((ann) => (
        <div
          key={ann._id}
          className={`p-6 rounded-3xl glass-card border shadow-2xl relative overflow-hidden transition-all ${
            ann.priority === 'Urgent'
              ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
              : ann.priority === 'Important'
              ? 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
              : 'border-sky-500/40 bg-slate-900/60 shadow-[0_0_30px_rgba(0,240,255,0.15)]'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl shrink-0 border ${
                ann.priority === 'Urgent'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : ann.priority === 'Important'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-400/40'
              }`}
            >
              <Megaphone className="w-6 h-6 animate-bounce" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-sky-300">
                  {ann.priority} ANNOUNCEMENT
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ann.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base md:text-lg font-bold text-white mb-2">{ann.title}</h3>
              <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed whitespace-pre-line">
                {ann.message}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-semibold">
                Posted by {ann.author || 'ALPHA Organizing Team'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
