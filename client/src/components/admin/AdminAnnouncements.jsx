import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Trash2, Edit3, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Published');
  const [priority, setPriority] = useState('Important');
  const [editingId, setEditingId] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements/all');
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/announcements/${editingId}`, { title, message, status, priority });
      } else {
        await axios.post('/api/announcements', { title, message, status, priority });
      }
      setTitle('');
      setMessage('');
      setStatus('Published');
      setPriority('Important');
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to save announcement');
    }
  };

  const handleEdit = (ann) => {
    setEditingId(ann._id);
    setTitle(ann.title);
    setMessage(ann.message);
    setStatus(ann.status);
    setPriority(ann.priority);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`/api/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  const toggleStatus = async (ann) => {
    try {
      const newStatus = ann.status === 'Published' ? 'Draft' : 'Published';
      await axios.put(`/api/announcements/${ann._id}`, { status: newStatus });
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">ANNOUNCEMENT MANAGEMENT</h1>
        <p className="text-xs text-slate-400">Publish live announcements to the participant dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <TiltCard className="p-6 lg:col-span-1">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>{editingId ? 'EDIT ANNOUNCEMENT' : 'NEW ANNOUNCEMENT'}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">TITLE *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Venue check-in instructions"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">MESSAGE *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter announcement text for participants..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-sky-500/30 text-white text-xs font-light focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">STATUS</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">PRIORITY</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setMessage('');
                  }}
                  className="w-1/3 py-2.5 text-xs font-bold text-slate-300 glass-card rounded-xl"
                >
                  CANCEL
                </button>
              )}
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-extrabold text-black bg-cyan-300 hover:bg-cyan-200 rounded-xl shadow-lg"
              >
                {editingId ? 'SAVE CHANGES' : 'PUBLISH ANNOUNCEMENT'}
              </button>
            </div>
          </form>
        </TiltCard>

        {/* List of Announcements */}
        <div className="lg:col-span-2 space-y-4">
          {announcements.map((ann) => (
            <TiltCard key={ann._id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ann.status === 'Published'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {ann.status}
                    </span>
                    <span className="text-[10px] font-bold text-sky-400 uppercase">{ann.priority} PRIORITY</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{ann.title}</h3>
                  <p className="text-xs text-slate-300 font-light leading-relaxed whitespace-pre-line">{ann.message}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleStatus(ann)}
                    className="p-2 text-slate-300 hover:text-cyan-300 bg-slate-900 rounded-lg"
                    title={ann.status === 'Published' ? 'Unpublish' : 'Publish'}
                  >
                    {ann.status === 'Published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(ann)}
                    className="p-2 text-slate-300 hover:text-sky-300 bg-slate-900 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-2 text-red-400 hover:text-red-300 bg-slate-900 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </TiltCard>
          ))}
          {announcements.length === 0 && (
            <div className="p-8 text-center text-slate-500 glass-card rounded-2xl">
              No announcements created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
