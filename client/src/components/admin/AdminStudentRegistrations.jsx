import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Filter, CheckCircle, XCircle, Trash2, Plus, FileSpreadsheet,
  AlertTriangle, Eye, RefreshCw, UserPlus, Check, X, ShieldCheck
} from 'lucide-react';
import { TiltCard } from '../common/TiltCard';
import { getScreenshotUrl } from '../../utils/imageUrl';

export const AdminStudentRegistrations = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters matching screenshot
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Modals
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);

  // Direct Registration Form State
  const [directForm, setDirectForm] = useState({
    studentName: '',
    regNo: '',
    department: 'CSE',
    year: 'III',
    section: 'A',
    mobile: '',
    email: '',
    utr: '',
    track: 'General Innovation',
    status: 'VERIFIED'
  });
  const [directError, setDirectError] = useState('');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (deptFilter) params.department = deptFilter;
      if (yearFilter) params.year = yearFilter;

      const res = await axios.get('/api/admin/teams', { params });
      setTeams(res.data || []);
    } catch (err) {
      console.error('Failed to fetch student registration records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [search, statusFilter, deptFilter, yearFilter]);

  // Bulk Verify All
  const handleVerifyAll = async () => {
    if (!window.confirm('Are you sure you want to verify ALL pending student registration records?')) return;
    setActionLoading(true);
    try {
      const res = await axios.put('/api/admin/teams/verify-all');
      alert(res.data?.message || 'All records verified successfully');
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify records');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete All Registrations
  const handleDeleteAll = async (e) => {
    e.preventDefault();
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type DELETE to confirm clearing all records.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await axios.delete('/api/admin/teams/delete-all');
      alert(res.data?.message || 'All registration records cleared');
      setShowDeleteAllModal(false);
      setDeleteConfirmText('');
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete records');
    } finally {
      setActionLoading(false);
    }
  };

  // Single Record Status Update
  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/admin/teams/${id}/payment`, { status });
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Single Record Delete
  const handleDeleteSingle = async (id, teamId) => {
    if (!window.confirm(`Are you sure you want to delete registration record ${teamId}?`)) return;
    setActionLoading(true);
    try {
      await axios.delete(`/api/admin/teams/${id}`);
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Direct Registration Submit
  const handleDirectRegisterSubmit = async (e) => {
    e.preventDefault();
    setDirectError('');
    if (!directForm.studentName || !directForm.regNo) {
      setDirectError('Student Name and Registration Number are required.');
      return;
    }

    setActionLoading(true);
    try {
      await axios.post('/api/admin/teams/direct-registration', directForm);
      setShowDirectModal(false);
      setDirectForm({
        studentName: '',
        regNo: '',
        department: 'CSE',
        year: 'III',
        section: 'A',
        mobile: '',
        email: '',
        utr: '',
        track: 'General Innovation',
        status: 'VERIFIED'
      });
      fetchRegistrations();
    } catch (err) {
      setDirectError(err.response?.data?.message || 'Direct registration failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (teams.length === 0) {
      alert('No student registration records available to export.');
      return;
    }
    const headers = ['Participant ID', 'Student Name', 'Reg No', 'Email', 'UTR Txn ID', 'Dept', 'Year', 'Status', 'Submitted At'];
    const rows = teams.map(t => {
      const lead = t.members && t.members[0] ? t.members[0] : {};
      return [
        t.teamId,
        `"${(lead.name || t.teamName).replace(/"/g, '""')}"`,
        lead.regNo || t.leadRegNo || '',
        t.leadEmail,
        t.payment?.utr || '',
        lead.department || 'CSE',
        lead.year || 'III',
        t.payment?.status || 'PENDING',
        t.createdAt ? new Date(t.createdAt).toISOString() : ''
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ALPHA_Student_Registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Container matching reference UI */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800/80 bg-slate-950/90 shadow-2xl space-y-5">
        
        {/* Title Heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black tracking-wide text-white uppercase flex items-center gap-2">
            <span>STUDENT REGISTRATION RECORDS</span>
            <span className="text-sm font-semibold text-slate-400">({teams.length} TOTAL)</span>
          </h2>

          <button
            onClick={fetchRegistrations}
            className="p-2 rounded-xl glass-button text-slate-400 hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Action Controls Bar matching screenshot exactly */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Participant ID, Name, Roll"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Status: All Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer min-w-[130px]"
          >
            <option value="">Status: All</option>
            <option value="VERIFIED">Status: Verified</option>
            <option value="PENDING">Status: Pending</option>
            <option value="REJECTED">Status: Rejected</option>
          </select>

          {/* Dept: All Dropdown */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer min-w-[120px]"
          >
            <option value="">Dept: All</option>
            {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML', 'IT', 'OTHERS'].map(d => (
              <option key={d} value={d}>Dept: {d}</option>
            ))}
          </select>

          {/* Year: All Dropdown */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer min-w-[110px]"
          >
            <option value="">Year: All</option>
            {['I', 'II', 'III', 'IV'].map(y => (
              <option key={y} value={y}>Year: {y}</option>
            ))}
          </select>

          {/* + + DIRECT REGISTRATION Button (Orange) */}
          <button
            onClick={() => setShowDirectModal(true)}
            className="px-5 py-2.5 text-xs font-extrabold tracking-wider text-white bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-600 hover:to-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ DIRECT REGISTRATION</span>
          </button>

          {/* VERIFY ALL Button (Green) */}
          <button
            onClick={handleVerifyAll}
            disabled={actionLoading}
            className="px-5 py-2.5 text-xs font-extrabold tracking-wider text-emerald-300 bg-emerald-950/60 border border-emerald-500/60 hover:bg-emerald-900/80 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>VERIFY ALL</span>
          </button>

          {/* Excel / CSV Button (Blue) */}
          <button
            onClick={exportCSV}
            className="px-5 py-2.5 text-xs font-extrabold tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-500/60 hover:bg-cyan-900/80 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Excel / CSV</span>
          </button>

        </div>

        {/* Second Row Buttons: DELETE ALL */}
        <div className="pt-2">
          <button
            onClick={() => setShowDeleteAllModal(true)}
            className="px-4 py-2 text-xs font-extrabold tracking-wider text-red-300 bg-red-950/60 border border-red-500/50 hover:bg-red-900/80 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>DELETE ALL</span>
          </button>
        </div>

      </div>

      {/* STUDENT REGISTRATION TABLE */}
      <div className="rounded-3xl glass-card border border-slate-800/80 bg-slate-950/90 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-900/40">
                <th className="py-4 px-6">PARTICIPANT ID</th>
                <th className="py-4 px-6">STUDENT DETAILS</th>
                <th className="py-4 px-6">REG NO</th>
                <th className="py-4 px-6">UPI / UTR TXN ID</th>
                <th className="py-4 px-6">DEPT / YEAR</th>
                <th className="py-4 px-6">PAYMENT PROOF</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6">SUBMITTED AT</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                    <p className="font-semibold text-xs">Loading registration records...</p>
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-20 text-center text-slate-400 font-medium">
                    No student registrations found.
                  </td>
                </tr>
              ) : (
                teams.map((t) => {
                  const lead = t.members?.find(
                    (m) =>
                      (m.regNo && m.regNo.toUpperCase() === (t.leadRegNo || '').toUpperCase()) ||
                      (m.email && m.email.toLowerCase() === (t.leadEmail || '').toLowerCase())
                  ) || t.members?.[0] || {};
                  const status = t.payment?.status || 'PENDING';

                  return (
                    <tr key={t._id} className="hover:bg-slate-900/50 transition-colors">
                      
                      {/* PARTICIPANT ID */}
                      <td className="py-4 px-6 font-mono font-black text-cyan-300">
                        {t.teamId}
                      </td>

                      {/* STUDENT DETAILS */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-xs">{lead.name || t.teamName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{t.leadEmail}</div>
                      </td>

                      {/* REG NO */}
                      <td className="py-4 px-6 font-mono font-bold text-slate-200 uppercase">
                        {lead.regNo || t.leadRegNo || 'N/A'}
                      </td>

                      {/* UPI / UTR TXN ID */}
                      <td className="py-4 px-6 font-mono text-amber-300 font-semibold">
                        {t.payment?.utr || 'N/A'}
                      </td>

                      {/* DEPT / YEAR */}
                      <td className="py-4 px-6 text-slate-300 font-semibold">
                        {lead.department || 'CSE'} / {lead.year || 'III'}
                      </td>

                      {/* PAYMENT PROOF */}
                      <td className="py-4 px-6">
                        {t.payment?.screenshotUrl ? (
                          <button
                            onClick={() => setSelectedProofUrl(getScreenshotUrl(t.payment.screenshotUrl))}
                            className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 text-[11px] font-bold flex items-center gap-1 hover:bg-sky-500/20 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">No Proof</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            status === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                              : status === 'REJECTED'
                              ? 'bg-red-500/20 text-red-300 border-red-400/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* SUBMITTED AT */}
                      <td className="py-4 px-6 text-[11px] text-slate-400 font-mono">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status !== 'VERIFIED' && (
                            <button
                              onClick={() => handleUpdateStatus(t._id, 'VERIFIED')}
                              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-all"
                              title="Verify Registration"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {status !== 'REJECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(t._id, 'REJECTED')}
                              className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-all"
                              title="Reject Registration"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteSingle(t._id, t.teamId)}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 transition-all"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIRECT REGISTRATION MODAL */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-lg w-full p-8 rounded-3xl glass-card border border-orange-500/40 shadow-2xl bg-slate-950/95 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-orange-400" />
                <h3 className="text-lg font-black text-white uppercase">DIRECT STUDENT REGISTRATION</h3>
              </div>
              <button
                onClick={() => setShowDirectModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {directError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold">
                {directError}
              </div>
            )}

            <form onSubmit={handleDirectRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  STUDENT NAME *
                </label>
                <input
                  type="text"
                  required
                  value={directForm.studentName}
                  onChange={(e) => setDirectForm({ ...directForm, studentName: e.target.value })}
                  placeholder="e.g. Prashanthi Reddy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    REGISTRATION NO *
                  </label>
                  <input
                    type="text"
                    required
                    value={directForm.regNo}
                    onChange={(e) => setDirectForm({ ...directForm, regNo: e.target.value })}
                    placeholder="e.g. 2100030220"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-400 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    MOBILE NO
                  </label>
                  <input
                    type="text"
                    value={directForm.mobile}
                    onChange={(e) => setDirectForm({ ...directForm, mobile: e.target.value })}
                    placeholder="9999999999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    DEPARTMENT
                  </label>
                  <select
                    value={directForm.department}
                    onChange={(e) => setDirectForm({ ...directForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-400"
                  >
                    {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML', 'IT', 'OTHERS'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    YEAR
                  </label>
                  <select
                    value={directForm.year}
                    onChange={(e) => setDirectForm({ ...directForm, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-400"
                  >
                    {['I', 'II', 'III', 'IV'].map(y => (
                      <option key={y} value={y}>{y} Year</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  UPI / UTR TRANSACTION ID
                </label>
                <input
                  type="text"
                  value={directForm.utr}
                  onChange={(e) => setDirectForm({ ...directForm, utr: e.target.value })}
                  placeholder="e.g. 426819203841"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-400 font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDirectModal(false)}
                  className="px-4 py-2.5 rounded-xl glass-button text-xs font-bold text-slate-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold shadow-lg"
                >
                  {actionLoading ? 'REGISTERING...' : 'CONFIRM REGISTRATION'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DELETE ALL CONFIRMATION MODAL */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-md w-full p-8 rounded-3xl glass-card border border-red-500/50 shadow-2xl bg-slate-950/95 space-y-6 text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase">CLEAR ALL REGISTRATIONS</h3>
              <p className="text-xs text-slate-300 mt-2">
                This action is irreversible. All student registration records, team profiles, and payment details will be permanently deleted.
              </p>
            </div>

            <form onSubmit={handleDeleteAll} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-red-300 uppercase tracking-wider mb-2">
                  TYPE "DELETE" TO CONFIRM
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-red-500/40 text-white text-xs font-mono tracking-widest text-center focus:outline-none focus:border-red-400 uppercase"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllModal(false)}
                  className="flex-1 py-3 rounded-xl glass-button text-xs font-bold text-slate-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
                >
                  {actionLoading ? 'CLEARING...' : 'DELETE ALL RECORDS'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* PAYMENT PROOF VIEWER MODAL */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-2xl w-full p-6 rounded-3xl glass-card border border-sky-500/40 bg-slate-950/95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">PAYMENT SCREENSHOT PROOF</h3>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center p-2 rounded-2xl bg-black">
              <img
                src={getScreenshotUrl(selectedProofUrl)}
                alt="Payment Proof"
                className="max-w-full h-auto max-h-[60vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
