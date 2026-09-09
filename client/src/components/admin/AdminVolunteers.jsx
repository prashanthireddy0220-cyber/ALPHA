import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Shield, ShieldAlert, KeyRound, Trash2, Edit3, CheckCircle, XCircle, Lock, Camera, CheckSquare } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const AdminVolunteers = ({ onRefresh }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(null);

  // Form states
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    volunteerId: '',
    username: '',
    password: '',
    attendancePermission: true,
    assignedSessions: []
  });

  const [resetPasswordInput, setResetPasswordInput] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [volRes, sessRes] = await Promise.all([
        axios.get('/api/volunteers'),
        axios.get('/api/attendance/sessions')
      ]);
      setVolunteers(volRes.data || []);
      setSessions(sessRes.data || []);
    } catch (err) {
      console.error('Failed to load volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateVolunteer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/volunteers', volunteerForm);
      setShowCreateModal(false);
      setVolunteerForm({
        name: '',
        volunteerId: '',
        username: '',
        password: '',
        attendancePermission: true,
        assignedSessions: []
      });
      fetchData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create volunteer account');
    }
  };

  const handleTogglePermission = async (id, currentPermission) => {
    try {
      await axios.put(`/api/volunteers/${id}`, {
        attendancePermission: !currentPermission
      });
      fetchData();
    } catch (err) {
      alert('Failed to update volunteer permission');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`/api/volunteers/${id}`, {
        status: currentStatus === 'active' ? 'disabled' : 'active'
      });
      fetchData();
    } catch (err) {
      alert('Failed to update volunteer status');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!showResetModal || !resetPasswordInput) return;
    try {
      await axios.put(`/api/volunteers/${showResetModal._id}/reset-password`, {
        newPassword: resetPasswordInput
      });
      alert(`Password reset successfully for ${showResetModal.name}`);
      setShowResetModal(null);
      setResetPasswordInput('');
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  const handleDeleteVolunteer = async (id, name) => {
    if (!window.confirm(`DELETE VOLUNTEER ACCOUNT "${name}"? This action will remove the account.`)) return;
    try {
      await axios.delete(`/api/volunteers/${id}`);
      fetchData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete volunteer');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">VOLUNTEER MANAGEMENT</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create volunteer accounts, reset passwords, set permissions, and assign attendance sessions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ CREATE VOLUNTEER ACCOUNT</span>
        </button>
      </div>

      {/* Volunteers Table / Cards */}
      <TiltCard className="p-6 rounded-3xl glass-card border border-sky-500/20 bg-slate-950/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Volunteer Info</th>
                <th className="pb-3">Volunteer ID</th>
                <th className="pb-3">Attendance Access</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {volunteers.map((vol) => (
                <tr key={vol._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 font-semibold text-white">
                    <div>{vol.name}</div>
                    <div className="text-[10px] text-slate-500">{vol.email}</div>
                  </td>
                  <td className="py-4 font-mono font-bold text-cyan-300">
                    {vol.volunteerId || 'VOL-UNASSIGNED'}
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handleTogglePermission(vol._id, vol.attendancePermission)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        vol.attendancePermission !== false
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'
                      }`}
                    >
                      {vol.attendancePermission !== false ? 'ENABLED ✓' : 'DISABLED ✕'}
                    </button>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      vol.status === 'active' ? 'bg-sky-500/10 text-sky-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {vol.status === 'active' ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      onClick={() => setShowResetModal(vol)}
                      className="px-3 py-1.5 text-[10px] font-bold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 rounded-lg transition-colors"
                      title="Reset Password"
                    >
                      <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                      Reset Pwd
                    </button>

                    <button
                      onClick={() => handleDeleteVolunteer(vol._id, vol.name)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {volunteers.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 text-xs">
                    No volunteer accounts created yet. Click "+ CREATE VOLUNTEER ACCOUNT" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TiltCard>

      {/* Create Volunteer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full p-6 md:p-8 rounded-3xl glass-card border border-sky-500/40 bg-slate-950 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">CREATE VOLUNTEER ACCOUNT</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateVolunteer} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">VOLUNTEER FULL NAME</label>
                <input
                  type="text"
                  required
                  value={volunteerForm.name}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">VOLUNTEER ID</label>
                  <input
                    type="text"
                    required
                    value={volunteerForm.volunteerId}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, volunteerId: e.target.value })}
                    placeholder="VOL102"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={volunteerForm.password}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, password: e.target.value })}
                    placeholder="Create password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">ATTENDANCE PERMISSION</label>
                <select
                  value={volunteerForm.attendancePermission ? 'true' : 'false'}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, attendancePermission: e.target.value === 'true' })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="true">ENABLED (Can Take Attendance)</option>
                  <option value="false">DISABLED (Locked)</option>
                </select>
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
                  CREATE VOLUNTEER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-sky-500/40 bg-slate-950 space-y-4 text-left">
            <h3 className="text-lg font-black text-white">RESET PASSWORD FOR {showResetModal.name}</h3>
            <p className="text-xs text-slate-400">Set a new password for Volunteer ID: {showResetModal.volunteerId}</p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">NEW PASSWORD</label>
                <input
                  type="password"
                  required
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="flex-1 py-3 text-xs font-bold text-slate-300 glass-button rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl"
                >
                  UPDATE PASSWORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
