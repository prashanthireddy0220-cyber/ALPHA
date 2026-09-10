import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, CheckCircle, Clock, ShieldCheck, Lock, Unlock,
  Plus, Settings, FileSpreadsheet, RefreshCw, Activity,
  Search, Filter, Eye, ExternalLink, Download, FileText,
  Trash2, Edit3, X, Check, AlertTriangle, Layers, Ticket,
  PieChart, ChevronDown, ChevronUp, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { getScreenshotUrl } from '../../utils/imageUrl';

export const AdminDashboard = () => {
  const { settings, fetchSettings } = useSettings();
  const [analytics, setAnalytics] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Main View Tab: 'teams' or 'settings' (Matches User Screenshots)
  const [activeMainTab, setActiveMainTab] = useState('teams');

  // Demographics visibility toggle
  const [showCharts, setShowCharts] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [accomFilter, setAccomFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectTeam, setInspectTeam] = useState(null);
  const [editTeam, setEditTeam] = useState(null);
  const [passTeam, setPassTeam] = useState(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    maxTeams: 60,
    registrationOpen: true,
    participantFee: 350,
    officialUpiId: '69097701@ubin',
    officialWhatsappGroup: 'https://chat.whatsapp.com/KQgGm91cXyS1WiZC8nVyls',
    qrScannerImageUrl: '/assets/payment_qr.png'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Add Registration form state
  const [addForm, setAddForm] = useState({
    studentName: '',
    regNo: '',
    department: 'CSE',
    year: 'III',
    section: 'A',
    mobile: '',
    email: '',
    utr: '',
    status: 'VERIFIED'
  });
  const [addingReg, setAddingReg] = useState(false);

  // Edit Team form state
  const [editForm, setEditForm] = useState({
    teamName: '',
    leadEmail: '',
    leadRegNo: '',
    utr: '',
    amount: 350,
    status: 'PENDING'
  });
  const [editingReg, setEditingReg] = useState(false);

  // Inspect rejection reason
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all analytics and teams
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, teamsRes] = await Promise.all([
        axios.get('/api/admin/analytics'),
        axios.get('/api/admin/teams')
      ]);

      setAnalytics(analyticsRes.data);
      setTeams(teamsRes.data || []);

      if (analyticsRes.data?.settings) {
        setSettingsForm({
          maxTeams: analyticsRes.data.settings.maxTeams || 60,
          registrationOpen: analyticsRes.data.settings.registrationOpen !== false,
          participantFee: analyticsRes.data.settings.participantFee || 350,
          officialUpiId: analyticsRes.data.settings.officialUpiId || '69097701@ubin',
          officialWhatsappGroup: analyticsRes.data.settings.officialWhatsappGroup || 'https://chat.whatsapp.com/KQgGm91cXyS1WiZC8nVyls',
          qrScannerImageUrl: analyticsRes.data.settings.qrScannerImageUrl || '/assets/payment_qr.png'
        });
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter and Sort teams logic
  const filteredTeams = teams.filter((t) => {
    // Search
    if (search) {
      const q = search.toLowerCase().trim();
      const matchId = t.teamId?.toLowerCase().includes(q);
      const matchName = t.teamName?.toLowerCase().includes(q);
      const matchLead = t.leadEmail?.toLowerCase().includes(q) || t.leadRegNo?.toLowerCase().includes(q);
      const matchUtr = t.payment?.utr?.toLowerCase().includes(q);
      const matchMember = t.members?.some(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.regNo?.toLowerCase().includes(q) ||
          m.mobile?.includes(q)
      );
      if (!matchId && !matchName && !matchLead && !matchUtr && !matchMember) return false;
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      const st = t.payment?.status || 'PENDING';
      if (st !== statusFilter) return false;
    }

    // Year Filter
    if (yearFilter !== 'ALL') {
      const matchYear = t.members?.some((m) => m.year === yearFilter || m.year?.includes(yearFilter));
      if (!matchYear) return false;
    }

    // Gender Filter
    if (genderFilter !== 'ALL') {
      const matchGender = t.members?.some(
        (m) => (m.gender || 'Male').toLowerCase() === genderFilter.toLowerCase()
      );
      if (!matchGender) return false;
    }

    // Department Filter
    if (deptFilter !== 'ALL') {
      const matchDept = t.members?.some((m) => m.department === deptFilter);
      if (!matchDept) return false;
    }

    // Accommodation Filter
    if (accomFilter !== 'ALL') {
      const matchAccom = t.members?.some((m) => (m.accommodation || 'Day Scholar') === accomFilter);
      if (!matchAccom) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortOrder === 'ASC') {
      return a.teamId.localeCompare(b.teamId, undefined, { numeric: true, sensitivity: 'base' });
    } else {
      return b.teamId.localeCompare(a.teamId, undefined, { numeric: true, sensitivity: 'base' });
    }
  });

  // Toggle Registration Lock
  const handleToggleLock = async () => {
    try {
      const currentStatus = settingsForm.registrationOpen;
      const newStatus = !currentStatus;

      await axios.put('/api/settings', { registrationOpen: newStatus });
      setSettingsForm((prev) => ({ ...prev, registrationOpen: newStatus }));
      await fetchSettings();
      await loadDashboardData();
    } catch (err) {
      alert('Failed to toggle registration: ' + (err.response?.data?.message || err.message));
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaveSuccess(false);
    try {
      await axios.put('/api/settings', settingsForm);
      await fetchSettings();
      await loadDashboardData();
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3500);
    } catch (err) {
      alert('Failed to save configuration: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle QR Image Upload
  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingQr(true);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = res.data.url;
      setSettingsForm((prev) => ({ ...prev, qrScannerImageUrl: imageUrl }));
    } catch (err) {
      alert('Failed to upload image: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingQr(false);
    }
  };

  // Add Direct Registration
  const handleAddRegistration = async (e) => {
    e.preventDefault();
    setAddingReg(true);
    try {
      await axios.post('/api/admin/teams/direct-registration', addForm);
      setShowAddModal(false);
      setAddForm({
        studentName: '',
        regNo: '',
        department: 'CSE',
        year: 'III',
        section: 'A',
        mobile: '',
        email: '',
        utr: '',
        status: 'VERIFIED'
      });
      await loadDashboardData();
      alert('Registration added successfully!');
    } catch (err) {
      alert('Failed to add registration: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingReg(false);
    }
  };

  // Open Edit Team Modal
  const handleOpenEdit = (team) => {
    setEditTeam(team);
    setEditForm({
      teamName: team.teamName || '',
      leadEmail: team.leadEmail || '',
      leadRegNo: team.leadRegNo || '',
      utr: team.payment?.utr || '',
      amount: team.payment?.amount || 350,
      status: team.payment?.status || 'PENDING'
    });
  };

  // Save Edit Team
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTeam) return;
    setEditingReg(true);
    try {
      await axios.put(`/api/admin/teams/${editTeam._id}/edit`, editForm);
      setEditTeam(null);
      await loadDashboardData();
      alert('Team updated successfully!');
    } catch (err) {
      alert('Failed to update team: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditingReg(false);
    }
  };

  // Update Payment Status (Inspect Modal)
  const handleUpdatePaymentStatus = async (teamId, status) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/admin/teams/${teamId}/payment`, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : ''
      });
      setInspectTeam(null);
      setRejectionReason('');
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Team
  const handleDeleteTeam = async (team) => {
    if (!window.confirm(`Are you sure you want to delete team ${team.teamName} (${team.teamId})? This action cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`/api/admin/teams/${team._id}`);
      await loadDashboardData();
      alert(`Team ${team.teamId} deleted successfully.`);
    } catch (err) {
      alert('Failed to delete team: ' + (err.response?.data?.message || err.message));
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredTeams.length === 0) return;
    const headers = ['Team ID', 'Team Name', 'Lead Name', 'Lead Reg No', 'Lead Email', 'UTR Number', 'Amount', 'Status', 'Registered At'];
    const rows = filteredTeams.map((t) => [
      t.teamId,
      `"${(t.teamName || '').replace(/"/g, '""')}"`,
      `"${(t.members?.[0]?.name || '').replace(/"/g, '""')}"`,
      t.leadRegNo || '',
      t.leadEmail || '',
      t.payment?.utr || '',
      t.payment?.amount || 0,
      t.payment?.status || 'PENDING',
      t.createdAt ? new Date(t.createdAt).toISOString() : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ALPHA_Teams_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Pass
  const handlePrintPass = (team) => {
    setPassTeam(team);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (loading || !analytics) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-4">
        <RefreshCw className="w-10 h-10 text-red-500 animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-300">LOADING ALPHA ADMIN CONTROL CENTER...</p>
      </div>
    );
  }

  const { stats, yearBreakdown, genderBreakdown, departmentBreakdown, accommodationBreakdown } = analytics;

  return (
    <div className="space-y-6">
      
      {/* ============================================================== */}
      {/* 1. TOP SUBHEADER & ACTION BUTTONS (Exact match to Screenshots) */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950/50 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>WEBX CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
            ADMIN DASHBOARD
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* TEAMS Tab Button */}
          <button
            onClick={() => setActiveMainTab('teams')}
            className={`px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeMainTab === 'teams'
                ? 'bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.7)] border border-red-500'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200'
            }`}
          >
            TEAMS ({stats.totalTeams})
          </button>

          {/* SETTINGS Tab Button */}
          <button
            onClick={() => setActiveMainTab('settings')}
            className={`px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'settings'
                ? 'bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.7)] border border-red-500'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>SETTINGS</span>
          </button>

          {/* LOCK / UNLOCK Button */}
          <button
            onClick={handleToggleLock}
            className="px-5 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            title="Toggle Registration Lock"
          >
            {settingsForm.registrationOpen ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>LOCK</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>UNLOCK</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TOP METRICS ROW - 8 DISTINCT STAT CARDS (Exact match) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* TOTAL TEAMS */}
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">TOTAL TEAMS</span>
          <div className="text-2xl font-black text-white font-mono mt-1.5">{stats.totalTeams}</div>
        </div>

        {/* CONFIRMED */}
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">CONFIRMED</span>
          <div className="text-2xl font-black text-blue-500 font-mono mt-1.5">{stats.confirmedTeams}</div>
        </div>

        {/* RESERVATIONS */}
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">RESERVATIONS</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1.5">{stats.activeReservations}</div>
        </div>

        {/* AVAILABLE */}
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">AVAILABLE</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">{stats.availableSlots}</div>
        </div>

        {/* PARTICIPANTS */}
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">PARTICIPANTS</span>
          <div className="text-2xl font-black text-fuchsia-400 font-mono mt-1.5">{stats.totalParticipants}</div>
        </div>

        {/* PENDING */}
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">PENDING</span>
          <div className="text-2xl font-black text-yellow-400 font-mono mt-1.5">{stats.pendingCount}</div>
        </div>

        {/* VERIFIED */}
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">VERIFIED</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">{stats.verifiedCount}</div>
        </div>

        {/* REJECTED */}
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">REJECTED</span>
          <div className="text-2xl font-black text-rose-500 font-mono mt-1.5">{stats.rejectedCount}</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB VIEW 1: GLOBAL HACKATHON SETTINGS (Exact match to Image 1) */}
      {/* ============================================================== */}
      {activeMainTab === 'settings' && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#0c1220] border border-slate-800/80 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Settings className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              GLOBAL HACKATHON SETTINGS
            </h2>
          </div>

          {settingsSaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Hackathon settings saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs text-left">
            {/* Row 1: Capacity & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  MAXIMUM TEAMS CAPACITY
                </label>
                <input
                  type="number"
                  value={settingsForm.maxTeams}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxTeams: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-[#070c18] border border-slate-800 text-white font-mono font-bold focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  REGISTRATION STATUS
                </label>
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, registrationOpen: !settingsForm.registrationOpen })}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer text-center ${
                    settingsForm.registrationOpen
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                  }`}
                >
                  {settingsForm.registrationOpen ? 'REGISTRATIONS OPEN' : 'REGISTRATIONS CLOSED'}
                </button>
              </div>
            </div>

            {/* Row 2: Fee & UPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  PARTICIPANT FEE (₹)
                </label>
                <input
                  type="number"
                  value={settingsForm.participantFee}
                  onChange={(e) => setSettingsForm({ ...settingsForm, participantFee: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-[#070c18] border border-slate-800 text-white font-mono font-bold focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  OFFICIAL UPI ID
                </label>
                <input
                  type="text"
                  value={settingsForm.officialUpiId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, officialUpiId: e.target.value })}
                  placeholder="69097701@ubin"
                  className="w-full px-4 py-3 rounded-xl bg-[#070c18] border border-slate-800 text-white font-mono font-bold focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3: WhatsApp Group Link */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                OFFICIAL WHATSAPP GROUP LINK
              </label>
              <input
                type="text"
                value={settingsForm.officialWhatsappGroup}
                onChange={(e) => setSettingsForm({ ...settingsForm, officialWhatsappGroup: e.target.value })}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-4 py-3 rounded-xl bg-[#070c18] border border-slate-800 text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Row 4: Scanner Box (Exact match to Screenshot) */}
            <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">↑</span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      OFFICIAL UPI QR SCANNER IMAGE
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Upload your official UPI QR scanner (PhonePe, Google Pay, Paytm, etc.). This image is displayed directly to students on the payment portal.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, qrScannerImageUrl: '' })}
                  className="px-4 py-1.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/50 text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  Remove Scanner
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                <div className="w-36 h-36 rounded-xl border border-slate-700 bg-white p-2 flex items-center justify-center shrink-0">
                  {settingsForm.qrScannerImageUrl ? (
                    <img
                      src={settingsForm.qrScannerImageUrl}
                      alt="UPI QR Scanner"
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <span className="text-slate-400 text-[10px] font-bold uppercase text-center">No Image Uploaded</span>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs cursor-pointer flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-red-400" />
                    <span>{uploadingQr ? 'UPLOADING...' : 'CHANGE / UPLOAD NEW SCANNER'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                      disabled={uploadingQr}
                    />
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Supports high-resolution PNG, JPG, JPEG, WEBP.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:from-red-500 hover:to-rose-400 transition-all cursor-pointer"
            >
              {savingSettings ? 'SAVING CONFIGURATION...' : 'SAVE SYSTEM CONFIGURATION'}
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB VIEW 2: TEAMS & DEMOGRAPHICS (Exact match to Image 2) */}
      {/* ============================================================== */}
      {activeMainTab === 'teams' && (
        <>
          {/* 3. REGISTRATION DEMOGRAPHICS ANALYTICS (Exact match) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  REGISTRATION DEMOGRAPHICS ANALYTICS
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-red-950/40 border border-red-500/50 text-red-400 text-[10px] font-black uppercase">
                  {stats.totalParticipants} PARTICIPANTS ({stats.totalTeams} TEAMS)
                </span>
              </div>

              <button
                onClick={() => setShowCharts(!showCharts)}
                className="text-[10px] font-extrabold text-slate-300 hover:text-white uppercase tracking-wider flex items-center gap-1 bg-slate-900 border border-slate-700 px-4 py-1.5 rounded-full cursor-pointer"
              >
                <span>{showCharts ? 'HIDE CHARTS ▲' : 'SHOW CHARTS ▼'}</span>
              </button>
            </div>

            {showCharts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Year Distribution */}
                <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      🎓
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Year Distribution</h3>
                      <span className="text-[10px] text-slate-400 block font-medium">{stats.totalParticipants} TOTAL PARTICIPANTS</span>
                    </div>
                  </div>

                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="12" fill="none" />
                      <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="12" fill="none" strokeDasharray="160 238" />
                      <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="12" fill="none" strokeDasharray="78 238" strokeDashoffset="-160" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-black text-white font-mono">{stats.totalParticipants}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">STUDENTS</span>
                    </div>
                  </div>
                </div>

                {/* 2. Gender Distribution */}
                <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                      👥
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Gender Distribution</h3>
                      <span className="text-[10px] text-slate-400 block font-medium">{stats.totalParticipants} TOTAL PARTICIPANTS</span>
                    </div>
                  </div>

                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="12" fill="none" />
                      <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="12" fill="none" strokeDasharray="150 238" />
                      <circle cx="50" cy="50" r="38" stroke="#ec4899" strokeWidth="12" fill="none" strokeDasharray="88 238" strokeDashoffset="-150" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-black text-white font-mono">{stats.totalParticipants}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">STUDENTS</span>
                    </div>
                  </div>
                </div>

                {/* 3. Department Distribution */}
                <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      🏢
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Department Distribution</h3>
                      <span className="text-[10px] text-slate-400 block font-medium">{stats.totalParticipants} TOTAL PARTICIPANTS</span>
                    </div>
                  </div>

                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="12" fill="none" />
                      <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="12" fill="none" strokeDasharray="165 238" />
                      <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="12" fill="none" strokeDasharray="65 238" strokeDashoffset="-165" />
                      <circle cx="50" cy="50" r="38" stroke="#06b6d4" strokeWidth="12" fill="none" strokeDasharray="8 238" strokeDashoffset="-230" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-black text-white font-mono">{stats.totalParticipants}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">STUDENTS</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> CSE</span>
                      <span className="font-mono font-bold text-slate-300">167 <span className="text-slate-500 font-normal">(70%)</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> ECE</span>
                      <span className="font-mono font-bold text-slate-300">66 <span className="text-slate-500 font-normal">(28%)</span></span>
                    </div>
                  </div>
                </div>

                {/* 4. Accommodation */}
                <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      🏠
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Accommodation</h3>
                      <span className="text-[10px] text-slate-400 block font-medium">{stats.totalParticipants} TOTAL PARTICIPANTS</span>
                    </div>
                  </div>

                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="12" fill="none" />
                      <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="170 238" />
                      <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="12" fill="none" strokeDasharray="68 238" strokeDashoffset="-170" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-black text-white font-mono">{stats.totalParticipants}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">STUDENTS</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. SEARCH, FILTERS & ACTION BUTTONS ROW */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Team ID, Team Name, Member, Reg No, Mobile, UTR..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0a0f1d] text-xs text-white placeholder-slate-500 border border-slate-800 focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer whitespace-nowrap uppercase"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ ADD REGISTRATION</span>
                </button>
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap hidden sm:inline">
                  Showing <span className="text-white font-mono">{filteredTeams.length}</span> of <span className="text-white font-mono">{teams.length}</span> Teams
                </span>
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">All Years</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL', 'BIO'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={accomFilter}
                onChange={(e) => setAccomFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">All Accommodation</option>
                <option value="Hosteller">Hosteller</option>
                <option value="Day Scholar">Day Scholar</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none"
              >
                <option value="ASC">Team ID (Asc)</option>
                <option value="DESC">Team ID (Desc)</option>
              </select>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={exportCSV}
                className="px-4 py-1.5 rounded-full border border-slate-700 bg-[#0a0f1d] text-slate-300 hover:text-white text-xs font-extrabold tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>EXCEL</span>
              </button>

              <button
                onClick={exportCSV}
                className="px-4 py-1.5 rounded-full border border-slate-700 bg-[#0a0f1d] text-slate-300 hover:text-white text-xs font-extrabold tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white text-xs font-extrabold tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT PDF REPORT</span>
              </button>
            </div>
          </div>

          {/* 5. TEAMS DATA TABLE */}
          <div className="overflow-hidden rounded-3xl bg-[#0a0f1d] border border-slate-800/80 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070c18] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">TEAM ID ↑</th>
                    <th className="p-4">TEAM NAME</th>
                    <th className="p-4">TEAM LEAD</th>
                    <th className="p-4">UTR NUMBER</th>
                    <th className="p-4">STATUS</th>
                    <th className="p-4 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredTeams.map((t) => {
                    const leadMember = t.members?.[0];
                    return (
                      <tr key={t._id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-4 font-mono font-black text-white tracking-wider">
                          {t.teamId}
                        </td>

                        <td className="p-4 text-white font-extrabold uppercase">
                          {t.teamName}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-200">
                            {leadMember?.name || t.leadEmail?.split('@')[0]}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {t.leadEmail}
                          </div>
                        </td>

                        <td className="p-4 font-mono text-slate-300">
                          {t.payment?.utr || 'N/A'}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                              t.payment?.status === 'VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : t.payment?.status === 'REJECTED'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {t.payment?.status || 'PENDING'}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setPassTeam(t)}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-300 bg-slate-900/90 border border-slate-700 hover:border-red-500 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Ticket className="w-3 h-3 text-red-400" />
                              <span>PASS</span>
                            </button>

                            <button
                              onClick={() => setInspectTeam(t)}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-300 bg-slate-900/90 border border-slate-700 hover:border-red-500 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Eye className="w-3 h-3 text-red-400" />
                              <span>INSPECT</span>
                            </button>

                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-300 bg-slate-900/90 border border-slate-700 hover:border-amber-400 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Edit3 className="w-3 h-3 text-amber-400" />
                              <span>EDIT</span>
                            </button>

                            <button
                              onClick={() => handleDeleteTeam(t)}
                              className="px-2.5 py-1 text-[11px] font-bold text-red-400 bg-red-950/40 border border-red-500/30 hover:bg-red-900/60 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>DELETE</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTeams.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500 text-xs">
                        No registered teams match the current query filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}


      {/* ============================================================== */}
      {/* 7. ADD REGISTRATION MODAL */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="max-w-lg w-full p-6 rounded-3xl glass-card border border-sky-500/40 bg-slate-950 shadow-[0_0_50px_rgba(0,240,255,0.2)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-black text-white uppercase tracking-wider">+ DIRECT ADMIN REGISTRATION</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRegistration} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">STUDENT FULL NAME *</label>
                <input
                  type="text"
                  required
                  value={addForm.studentName}
                  onChange={(e) => setAddForm({ ...addForm, studentName: e.target.value.toUpperCase() })}
                  placeholder="e.g. PRASHANTHI REDDY"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold uppercase focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">REGISTRATION NO *</label>
                  <input
                    type="text"
                    required
                    value={addForm.regNo}
                    onChange={(e) => setAddForm({ ...addForm, regNo: e.target.value.toUpperCase() })}
                    placeholder="99240040717"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">DEPARTMENT</label>
                  <select
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none"
                  >
                    {['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">YEAR</label>
                  <select
                    value={addForm.year}
                    onChange={(e) => setAddForm({ ...addForm, year: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none"
                  >
                    <option value="II">II Year</option>
                    <option value="III">III Year</option>
                    <option value="IV">IV Year</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">SECTION</label>
                  <input
                    type="text"
                    value={addForm.section}
                    onChange={(e) => setAddForm({ ...addForm, section: e.target.value.toUpperCase() })}
                    placeholder="S08"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">MOBILE</label>
                  <input
                    type="text"
                    value={addForm.mobile}
                    onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                    placeholder="9999999999"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">UTR NUMBER</label>
                  <input
                    type="text"
                    value={addForm.utr}
                    onChange={(e) => setAddForm({ ...addForm, utr: e.target.value })}
                    placeholder="459821937188"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">PAYMENT STATUS</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={addingReg}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase cursor-pointer shadow-lg"
              >
                {addingReg ? 'ADDING REGISTRATION...' : 'CONFIRM & ADD REGISTRATION'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. INSPECT / AUDIT TEAM MODAL */}
      {/* ============================================================== */}
      {inspectTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="max-w-3xl w-full p-6 md:p-8 rounded-3xl glass-card border border-sky-500/40 bg-slate-950 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest block">AUDIT TEAM REGISTRATION</span>
                <h2 className="text-xl font-black text-white">{inspectTeam.teamName} ({inspectTeam.teamId})</h2>
              </div>
              <button onClick={() => setInspectTeam(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Roster Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Team Participants ({inspectTeam.members?.length || 0} Members)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {inspectTeam.members?.map((m, idx) => (
                  <div key={m._id || idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-extrabold text-white flex justify-between">
                      <span>{m.name}</span>
                      <span className="font-mono text-cyan-400">{m.regNo}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">Dept: {m.department} | Year: {m.year} | Sec: {m.section}</div>
                    <div className="text-slate-400 text-[11px]">Mobile: {m.mobile} | {m.accommodation}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <h3 className="font-bold text-cyan-400 uppercase mb-2">Payment Audit Info</h3>
                <p className="text-slate-300">UTR Number: <span className="font-mono font-bold text-white">{inspectTeam.payment?.utr}</span></p>
                <p className="text-slate-300 mt-1">Amount Paid: <span className="font-bold text-cyan-300">₹{inspectTeam.payment?.amount}</span></p>
                <p className="text-slate-300 mt-1">Status: <span className="font-bold text-amber-300">{inspectTeam.payment?.status}</span></p>

                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rejection Note (If Rejecting)</label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-cyan-400 uppercase mb-2">Payment Screenshot Preview</h3>
                {inspectTeam.payment?.screenshotUrl ? (
                  <div className="space-y-2">
                    <img
                      src={getScreenshotUrl(inspectTeam.payment.screenshotUrl)}
                      alt="Payment Screenshot"
                      className="w-full max-h-48 object-contain rounded-xl border border-slate-800 bg-black p-1"
                    />
                    <a
                      href={getScreenshotUrl(inspectTeam.payment.screenshotUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Original Image
                    </a>
                  </div>
                ) : (
                  <p className="text-slate-500">No screenshot attached</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => handleUpdatePaymentStatus(inspectTeam._id, 'REJECTED')}
                className="w-1/2 py-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-extrabold text-xs tracking-wider"
              >
                REJECT PAYMENT
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleUpdatePaymentStatus(inspectTeam._id, 'VERIFIED')}
                className="w-1/2 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs tracking-wider shadow-lg"
              >
                VERIFY & CONFIRM TEAM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. EDIT TEAM MODAL */}
      {/* ============================================================== */}
      {editTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-sky-500/40 bg-slate-950 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-black text-white uppercase tracking-wider">EDIT TEAM ({editTeam.teamId})</h2>
              <button onClick={() => setEditTeam(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">TEAM NAME</label>
                <input
                  type="text"
                  required
                  value={editForm.teamName}
                  onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-extrabold uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">LEAD EMAIL</label>
                <input
                  type="email"
                  required
                  value={editForm.leadEmail}
                  onChange={(e) => setEditForm({ ...editForm, leadEmail: e.target.value.toLowerCase() })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">UTR NUMBER</label>
                  <input
                    type="text"
                    value={editForm.utr}
                    onChange={(e) => setEditForm({ ...editForm, utr: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">STATUS</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={editingReg}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 text-black font-extrabold text-xs tracking-wider uppercase cursor-pointer shadow-lg"
              >
                {editingReg ? 'SAVING CHANGES...' : 'SAVE TEAM CHANGES'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. EVENT PASS PREVIEW MODAL */}
      {/* ============================================================== */}
      {passTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="max-w-2xl w-full p-6 md:p-8 rounded-3xl glass-card border border-sky-500/40 bg-slate-950 shadow-[0_0_60px_rgba(0,240,255,0.3)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">OFFICIAL ADMISSION PASS PREVIEW</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrintPass(passTeam)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-400 text-black font-extrabold text-xs shadow-md flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PRINT / DOWNLOAD PASS</span>
                </button>
                <button onClick={() => setPassTeam(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PASS CONTENT CARD */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 text-left relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src="/assets/kare_logo.jpg" alt="KARE Logo" className="w-12 h-12 rounded-full border border-sky-400/40" />
                  <div>
                    <h2 className="text-base font-black text-white tracking-wider">ALPHA 2026 OFFICIAL PASS</h2>
                    <p className="text-[11px] font-bold text-cyan-400 tracking-wider">KARE IEEE EDUCATION SOCIETY</p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase mb-2">
                    ● ACTIVE ADMISSION PASS
                  </span>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://alpha-ieee-eds.vercel.app/verify/${passTeam.teamId}`}
                    alt="QR Verification"
                    className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-700"
                  />
                  <span className="text-[9px] font-mono text-slate-400 block mt-1">SCAN TO VERIFY</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">TEAM NAME</span>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">{passTeam.teamName}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-300 text-black font-extrabold text-[10px]">TEAM LEAD</span>
                  <span className="text-xs font-bold text-slate-300">{passTeam.members?.[0]?.name} ({passTeam.leadEmail})</span>
                </div>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-2 tracking-wider">
                  TEAM ID: {passTeam.teamId}
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">EVENT VENUE</span>
                  <span className="text-xs font-extrabold text-white">8th Block Seminar Hall</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">REPORTING TIME</span>
                  <span className="text-xs font-extrabold text-white">08:30 AM, 1st October</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">PAYMENT REF (UTR)</span>
                  <span className="text-xs font-mono font-extrabold text-cyan-400">{passTeam.payment?.utr || 'N/A'}</span>
                </div>
              </div>

              {/* Participants Roster */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  TEAM PARTICIPANTS ({passTeam.members?.length || 0} MEMBERS)
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {passTeam.members?.map((m, idx) => (
                    <div
                      key={m._id || idx}
                      className={`p-3 rounded-xl border ${idx === 0 ? 'bg-cyan-950/20 border-cyan-500/40' : 'bg-slate-900 border-slate-800'}`}
                    >
                      <div className="flex justify-between items-center font-extrabold">
                        <span className="text-white">{idx + 1}. {m.name}</span>
                        <span className="font-mono text-cyan-300">{m.regNo}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Dept: <span className="font-bold text-white">{m.department}</span> | Year: <span className="font-bold text-white">{m.year}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Mobile: <span className="font-mono text-slate-300">{m.mobile}</span> | Accomm: <span className="font-bold text-slate-300">{m.accommodation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>OFFICIAL VERIFIED BADGE • KARE IEEE HACKATHON 2026</span>
                <span>PASS ID: {passTeam.teamId} • 2EE CREDITS COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
