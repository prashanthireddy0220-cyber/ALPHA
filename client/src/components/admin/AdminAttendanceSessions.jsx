import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Play, Square, Trash2, Edit3, Lock, Unlock, Calendar, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const AdminAttendanceSessions = ({ onRefresh }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmCloseModal, setConfirmCloseModal] = useState(null);

  // New session form state
  const [sessionForm, setSessionForm] = useState({
    name: '',
    date: '01/10/2026',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    description: '',
    expectedParticipants: 250
  });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/attendance/sessions');
      setSessions(res.data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/attendance/sessions', sessionForm);
      setShowCreateModal(false);
      setSessionForm({
        name: '',
        date: '01/10/2026',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        description: '',
        expectedParticipants: 250
      });
      fetchSessions();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create session');
    }
  };

  const handleToggleStatus = async (sessionId, currentStatus) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    
    if (currentStatus === 'OPEN') {
      // Require confirmation before closing
      const sessionToClose = sessions.find(s => s._id === sessionId);
      setConfirmCloseModal(sessionToClose);
      return;
    }

    try {
      await axios.put(`/api/attendance/sessions/${sessionId}/status`, { status: 'OPEN' });
      fetchSessions();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to open attendance session');
    }
  };

  const executeCloseSession = async () => {
    if (!confirmCloseModal) return;
    try {
      await axios.put(`/api/attendance/sessions/${confirmCloseModal._id}/status`, { status: 'CLOSED' });
      fetchSessions();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to close attendance session');
    } finally {
      setConfirmCloseModal(null);
    }
  };

  const handleDeleteSession = async (id, name) => {
    if (!window.confirm(`DELETE ATTENDANCE SESSION "${name}"? This action will remove the session and its records.`)) return;
    try {
      await axios.delete(`/api/attendance/sessions/${id}`);
      fetchSessions();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete session');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">ATTENDANCE SESSIONS MANAGEMENT</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create, configure, open, and close session-wise attendance tracking.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE ATTENDANCE SESSION</span>
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((sess) => {
          const isOpen = sess.status === 'OPEN';
          const pct = sess.expectedParticipants ? Math.round(((sess.presentCount || 0) / sess.expectedParticipants) * 100) : 0;

          return (
            <TiltCard
              key={sess._id}
              className={`p-6 rounded-3xl glass-card border ${
                isOpen ? 'border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-sky-500/20 bg-slate-950/80'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  {sess.date}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  isOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isOpen ? '🟢 ATTENDANCE OPEN' : '🔒 CLOSED'}
                </span>
              </div>

              <h3 className="text-lg font-black text-white mb-1">{sess.name}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-1">{sess.description || 'Session-wise attendance tracking'}</p>

              {/* Time & Expected Info */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 mb-6">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Timing:
                  </span>
                  <span className="font-semibold">{sess.startTime} - {sess.endTime}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Present Count:
                  </span>
                  <span className="font-bold text-cyan-300 font-mono">{sess.presentCount || 0} / {sess.expectedParticipants || 250} ({pct}%)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(sess._id, sess.status)}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isOpen
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                      : 'bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {isOpen ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isOpen ? 'CLOSE ATTENDANCE' : 'OPEN ATTENDANCE'}</span>
                </button>

                <button
                  onClick={() => handleDeleteSession(sess._id, sess.name)}
                  className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-slate-800"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </TiltCard>
          );
        })}

        {sessions.length === 0 && !loading && (
          <div className="col-span-full p-12 text-center rounded-3xl glass-card border border-sky-500/20">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Attendance Sessions Created Yet</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Click below to create your first session (e.g. Morning Session, Afternoon Session).</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 text-xs font-bold text-black bg-cyan-400 rounded-xl"
            >
              + Create First Session
            </button>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-lg w-full p-6 md:p-8 rounded-3xl glass-card border border-sky-500/40 bg-slate-950 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">CREATE ATTENDANCE SESSION</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">SESSION NAME</label>
                <input
                  type="text"
                  required
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  placeholder="e.g. Morning Session, Afternoon Session"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">DATE</label>
                  <input
                    type="text"
                    required
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">EXPECTED PARTICIPANTS</label>
                  <input
                    type="number"
                    value={sessionForm.expectedParticipants}
                    onChange={(e) => setSessionForm({ ...sessionForm, expectedParticipants: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">START TIME</label>
                  <input
                    type="text"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">END TIME</label>
                  <input
                    type="text"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    placeholder="12:00 PM"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">DESCRIPTION</label>
                <textarea
                  rows="2"
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                  placeholder="Optional session notes"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-300 glass-button rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl"
                >
                  CREATE SESSION (CLOSED)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Closing Session */}
      {confirmCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-red-500/40 bg-slate-950 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto animate-pulse" />
            <h3 className="text-lg font-black text-white uppercase">
              CLOSE ATTENDANCE SESSION?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to close <strong className="text-white">"{confirmCloseModal.name}"</strong>?
              Volunteers will no longer be able to scan QR codes or mark attendance for this session.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmCloseModal(null)}
                className="flex-1 py-3 text-xs font-bold text-slate-300 glass-button rounded-xl"
              >
                CANCEL
              </button>
              <button
                onClick={executeCloseSession}
                className="flex-1 py-3 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-500 shadow-lg"
              >
                CLOSE SESSION NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
