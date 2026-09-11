import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Users, CheckCircle, Clock, ShieldCheck, Lock, Unlock,
  Plus, Settings, FileSpreadsheet, RefreshCw, Activity,
  Search, Filter, Eye, ExternalLink, Download, FileText,
  Trash2, Edit3, X, Check, AlertTriangle, Layers, Ticket,
  PieChart, ChevronDown, ChevronUp, Image as ImageIcon, Sparkles,
  Printer, ArrowUpRight, ZoomIn, Crown, User
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettings } from '../../contexts/SettingsContext';
import { getScreenshotUrl } from '../../utils/imageUrl';
import { OfficialEventPass } from '../common/OfficialEventPass';

export const AdminDashboard = () => {
  const { settings, fetchSettings } = useSettings();
  const [analytics, setAnalytics] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Main View Tab: 'teams' or 'settings' (Matches User Reference)
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
  const [showAllPassesModal, setShowAllPassesModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    maxTeams: 60,
    registrationOpen: true,
    participantFee: 350,
    officialUpiId: '69097701@ubin',
    officialWhatsappGroup: 'https://chat.whatsapp.com/BST4xC9Kdkc3ccZ30BLWYo',
    qrScannerImageUrl: '/assets/payment_qr.png'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Add Team Registration form state (Full Team + 4 Members)
  const defaultAddMember = {
    name: '',
    regNo: '',
    department: 'CSE',
    year: 'III',
    section: 'A',
    mobile: '',
    email: '',
    gender: 'Male',
    accommodation: 'Day Scholar',
    hostel: '',
    roomNumber: ''
  };

  const [addForm, setAddForm] = useState({
    teamName: '',
    track: 'DRAGON INTELLIGENCE (AI & ML)',
    members: [
      { ...defaultAddMember },
      { ...defaultAddMember },
      { ...defaultAddMember },
      { ...defaultAddMember }
    ],
    utr: '',
    amount: 1400,
    screenshotUrl: '',
    status: 'VERIFIED'
  });
  const [activeAddMemberTab, setActiveAddMemberTab] = useState(0);
  const [addingReg, setAddingReg] = useState(false);

  // Edit Team form state
  const [editForm, setEditForm] = useState({
    teamName: '',
    track: 'DRAGON INTELLIGENCE (AI & ML)',
    leadMemberIndex: 0,
    amount: 1400,
    status: 'PENDING',
    utr: '',
    screenshotUrl: '',
    members: []
  });
  const [activeEditMemberTab, setActiveEditMemberTab] = useState(0);
  const [editingReg, setEditingReg] = useState(false);

  // Rejection note
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Instant SWR Load (0ms Perceived Latency with sessionStorage cache)
  const loadDashboardData = async (isBackground = false) => {
    try {
      if (!isBackground && !analytics) {
        setLoading(true);
      }
      const [analyticsRes, teamsRes] = await Promise.all([
        axios.get(`/api/admin/analytics?_t=${Date.now()}`),
        axios.get(`/api/admin/teams?_t=${Date.now()}`)
      ]);

      setAnalytics(analyticsRes.data);
      const teamsData = teamsRes.data || [];
      setTeams(teamsData);

      if (analyticsRes.data?.settings) {
        setSettingsForm({
          maxTeams: analyticsRes.data.settings.maxTeams || 60,
          registrationOpen: analyticsRes.data.settings.registrationOpen !== false,
          participantFee: analyticsRes.data.settings.participantFee || 350,
          officialUpiId: analyticsRes.data.settings.officialUpiId || '69097701@ubin',
          officialWhatsappGroup: analyticsRes.data.settings.officialWhatsappGroup || 'https://chat.whatsapp.com/BST4xC9Kdkc3ccZ30BLWYo',
          qrScannerImageUrl: analyticsRes.data.settings.qrScannerImageUrl || '/assets/payment_qr.png'
        });
      }

      // Persist to session cache
      sessionStorage.setItem('alpha_admin_cache', JSON.stringify({
        analytics: analyticsRes.data,
        teams: teamsData,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Instant Cache Hydration
    try {
      const cached = sessionStorage.getItem('alpha_admin_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.analytics && parsed.teams) {
          setAnalytics(parsed.analytics);
          setTeams(parsed.teams);
          if (parsed.analytics.settings) {
            setSettingsForm({
              maxTeams: parsed.analytics.settings.maxTeams || 60,
              registrationOpen: parsed.analytics.settings.registrationOpen !== false,
              participantFee: parsed.analytics.settings.participantFee || 350,
              officialUpiId: parsed.analytics.settings.officialUpiId || '69097701@ubin',
              officialWhatsappGroup: parsed.analytics.settings.officialWhatsappGroup || 'https://chat.whatsapp.com/BST4xC9Kdkc3ccZ30BLWYo',
              qrScannerImageUrl: parsed.analytics.settings.qrScannerImageUrl || '/assets/payment_qr.png'
            });
          }
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    // 2. Fetch fresh data in background
    loadDashboardData(false);
  }, []);

  // Filter and Sort teams logic
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
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
        const matchDept = t.members?.some((m) => (m.department || 'CSE').toUpperCase() === deptFilter.toUpperCase());
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
        return (a.teamId || '').localeCompare(b.teamId || '', undefined, { numeric: true, sensitivity: 'base' });
      } else {
        return (b.teamId || '').localeCompare(a.teamId || '', undefined, { numeric: true, sensitivity: 'base' });
      }
    });
  }, [teams, search, statusFilter, yearFilter, genderFilter, deptFilter, accomFilter, sortOrder]);

  // Compute Live Demographics from Loaded Teams & Members
  const computedDemographics = useMemo(() => {
    let totalParticipants = 0;
    const yearCounts = { 'Year II': 0, 'Year III': 0, 'Year IV': 0 };
    const genderCounts = { Male: 0, Female: 0 };
    const deptCounts = { CSE: 0, ECE: 0, IT: 0, EEE: 0, MECH: 0, CIVIL: 0, BIO: 0, OTHERS: 0 };
    const accomCounts = { Hosteller: 0, 'Day Scholar': 0 };

    teams.forEach((t) => {
      (t.members || []).forEach((m) => {
        totalParticipants += 1;

        // Year
        const y = m.year || 'III';
        if (y.includes('II') && !y.includes('III')) yearCounts['Year II'] += 1;
        else if (y.includes('III')) yearCounts['Year III'] += 1;
        else if (y.includes('IV')) yearCounts['Year IV'] += 1;
        else yearCounts['Year III'] += 1;

        // Gender
        const g = (m.gender || 'Male').toLowerCase() === 'female' ? 'Female' : 'Male';
        genderCounts[g] += 1;

        // Dept
        const d = (m.department || 'CSE').toUpperCase();
        if (deptCounts[d] !== undefined) deptCounts[d] += 1;
        else deptCounts.OTHERS += 1;

        // Accommodation
        const a = (m.accommodation || 'Day Scholar').toLowerCase().includes('hostel') ? 'Hosteller' : 'Day Scholar';
        accomCounts[a] += 1;
      });
    });

    return {
      totalParticipants: totalParticipants || analytics?.stats?.totalParticipants || 0,
      totalTeams: teams.length,
      year: [
        { label: 'Year III', count: yearCounts['Year III'], color: '#ef4444' },
        { label: 'Year IV', count: yearCounts['Year IV'], color: '#3b82f6' },
        { label: 'Year II', count: yearCounts['Year II'], color: '#10b981' }
      ].filter(item => item.count > 0 || totalParticipants === 0),
      gender: [
        { label: 'Male', count: genderCounts.Male, color: '#3b82f6' },
        { label: 'Female', count: genderCounts.Female, color: '#ec4899' }
      ],
      dept: [
        { label: 'CSE', count: deptCounts.CSE, color: '#ef4444' },
        { label: 'ECE', count: deptCounts.ECE, color: '#3b82f6' },
        { label: 'IT', count: deptCounts.IT, color: '#06b6d4' },
        { label: 'EEE', count: deptCounts.EEE, color: '#f59e0b' },
        { label: 'MECH', count: deptCounts.MECH, color: '#8b5cf6' },
        { label: 'CIVIL', count: deptCounts.CIVIL, color: '#10b981' },
        { label: 'BIO', count: deptCounts.BIO, color: '#ec4899' },
        { label: 'OTHERS', count: deptCounts.OTHERS, color: '#64748b' }
      ].filter(item => item.count > 0 || (item.label === 'CSE' && totalParticipants === 0)),
      accom: [
        { label: 'Hosteller', count: accomCounts.Hosteller, color: '#10b981' },
        { label: 'Day Scholar', count: accomCounts['Day Scholar'], color: '#f59e0b' }
      ]
    };
  }, [teams, analytics]);

  // Toggle Registration Lock
  const handleToggleLock = async () => {
    try {
      const currentStatus = settingsForm.registrationOpen;
      const newStatus = !currentStatus;

      await axios.put('/api/settings', { registrationOpen: newStatus });
      setSettingsForm((prev) => ({ ...prev, registrationOpen: newStatus }));
      await fetchSettings();
      await loadDashboardData(true);
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
      await loadDashboardData(true);
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
    if (!addForm.teamName.trim()) {
      alert('Team Name is required');
      return;
    }
    const lead = addForm.members[0];
    if (!lead.name.trim() || !lead.regNo.trim()) {
      alert('Team Lead (Member 1) Name and Registration Number are required.');
      return;
    }

    setAddingReg(true);
    try {
      await axios.post('/api/admin/teams/direct-registration', addForm);
      setShowAddModal(false);
      setAddForm({
        teamName: '',
        track: 'DRAGON INTELLIGENCE (AI & ML)',
        members: [
          { ...defaultAddMember },
          { ...defaultAddMember },
          { ...defaultAddMember },
          { ...defaultAddMember }
        ],
        utr: '',
        amount: 1400,
        screenshotUrl: '',
        status: 'VERIFIED'
      });
      setActiveAddMemberTab(0);
      await loadDashboardData(true);
      alert('Direct Team Registration created successfully!');
    } catch (err) {
      alert('Failed to register team: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingReg(false);
    }
  };

  // Open Edit Team Modal
  const handleOpenEdit = (team) => {
    if (!team) return;
    setEditTeam(team);
    const rawMembers = Array.isArray(team.members) ? team.members : [];
    const existingMembers = rawMembers.map((m) => {
      const isObj = typeof m === 'object' && m !== null;
      return {
        _id: isObj ? (m._id || null) : (typeof m === 'string' ? m : null),
        name: isObj ? (m.name || '') : '',
        regNo: isObj ? (m.regNo || '') : '',
        department: isObj ? (m.department || 'CSE') : 'CSE',
        year: isObj ? (m.year || 'III') : 'III',
        section: isObj ? (m.section || 'A') : 'A',
        mobile: isObj ? (m.mobile || '') : '',
        email: isObj ? (m.email || (m.regNo ? `${m.regNo.toLowerCase()}@klu.ac.in` : '')) : '',
        gender: isObj ? (m.gender || 'Male') : 'Male',
        accommodation: isObj ? (m.accommodation || 'Day Scholar') : 'Day Scholar',
        hostel: isObj ? (m.hostel || 'N/A') : 'N/A',
        roomNumber: isObj ? (m.roomNumber || 'N/A') : 'N/A'
      };
    });

    while (existingMembers.length < 4) {
      existingMembers.push({
        _id: null,
        name: '',
        regNo: '',
        department: 'CSE',
        year: 'III',
        section: 'A',
        mobile: '',
        email: '',
        gender: 'Male',
        accommodation: 'Day Scholar',
        hostel: 'N/A',
        roomNumber: 'N/A'
      });
    }

    let leadIdx = 0;
    const foundLeadIdx = existingMembers.findIndex(m =>
      (m.regNo && m.regNo.toUpperCase() === (team.leadRegNo || '').toUpperCase()) ||
      (m.email && m.email.toLowerCase() === (team.leadEmail || '').toLowerCase())
    );
    if (foundLeadIdx >= 0) leadIdx = foundLeadIdx;

    setEditForm({
      teamName: team.teamName || '',
      track: team.track || 'DRAGON INTELLIGENCE (AI & ML)',
      leadMemberIndex: leadIdx,
      amount: team.payment?.amount !== undefined ? team.payment.amount : 1400,
      status: team.payment?.status || 'PENDING',
      utr: team.payment?.utr || '',
      screenshotUrl: team.payment?.screenshotUrl || '',
      members: existingMembers
    });
    setActiveEditMemberTab(0);
  };

  // Handle member field changes in Edit Team Modal
  const handleEditMemberChange = (index, field, value) => {
    setEditForm(prev => {
      const updatedMembers = [...prev.members];
      updatedMembers[index] = {
        ...updatedMembers[index],
        [field]: value
      };
      if (field === 'regNo') {
        const cleanReg = value.trim().toUpperCase();
        updatedMembers[index].regNo = cleanReg;
        if (!updatedMembers[index].customEmail) {
          updatedMembers[index].email = cleanReg ? `${cleanReg.toLowerCase()}@klu.ac.in` : '';
        }
      }
      return { ...prev, members: updatedMembers };
    });
  };

  // Save Edit Team
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTeam) return;
    setEditingReg(true);
    try {
      const payload = {
        teamName: editForm.teamName,
        track: editForm.track,
        amount: editForm.amount,
        status: editForm.status,
        leadMemberIndex: editForm.leadMemberIndex,
        members: editForm.members
      };
      const res = await axios.put(`/api/admin/teams/${editTeam._id}/edit`, payload);
      const updated = res.data?.team;
      if (updated) {
        setTeams(prev => prev.map(t => (t._id === updated._id ? updated : t)));
        if (inspectTeam && inspectTeam._id === updated._id) {
          setInspectTeam(updated);
        }
      }
      setEditTeam(null);
      sessionStorage.removeItem('alpha_admin_cache');
      await loadDashboardData(true);
      alert('Team and member roster updated successfully!');
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
      await loadDashboardData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Team
  const handleDeleteTeam = async (team) => {
    if (!window.confirm(`Are you sure you want to delete team "${team.teamName}" (${team.teamId})? This action cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`/api/admin/teams/${team._id}`);
      if (inspectTeam && inspectTeam._id === team._id) {
        setInspectTeam(null);
      }
      await loadDashboardData(true);
      alert(`Team ${team.teamId} deleted successfully.`);
    } catch (err) {
      alert('Failed to delete team: ' + (err.response?.data?.message || err.message));
    }
  };

  // Replace / Attach Screenshot directly in Inspect Modal
  const handleReplaceInspectScreenshot = async (e) => {
    const file = e.target.files[0];
    if (!file || !inspectTeam) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      try {
        await axios.put(`/api/admin/teams/${inspectTeam._id}/edit`, {
          screenshotUrl: base64Data
        });
        setInspectTeam(prev => ({
          ...prev,
          payment: {
            ...prev.payment,
            screenshotUrl: base64Data
          }
        }));
        await loadDashboardData(true);
        alert('Screenshot updated successfully!');
      } catch (err) {
        alert('Failed to update screenshot: ' + (err.response?.data?.message || err.message));
      }
    };
    reader.readAsDataURL(file);
  };

  // Export CSV - Complete All Team & Teammate Details
  const exportCSV = () => {
    if (filteredTeams.length === 0) {
      alert('No teams to export');
      return;
    }
    const headers = [
      'Team ID',
      'Team Name',
      'Track',
      'Payment Status',
      'UTR Number',
      'Amount (INR)',
      'Registration Date',
      'Member #',
      'Role',
      'Member Name',
      'Reg No',
      'Student Email',
      'Department',
      'Year',
      'Section',
      'Mobile',
      'Gender',
      'Accommodation',
      'Hostel',
      'Room Number'
    ];

    const rows = [];
    filteredTeams.forEach((t) => {
      const membersList = (t.members && t.members.length > 0) ? t.members : [];
      const totalSlots = Math.max(4, membersList.length);
      const leadReg = (t.leadRegNo || '').toUpperCase();
      const leadEmail = (t.leadEmail || '').toLowerCase();

      for (let i = 0; i < totalSlots; i++) {
        const m = membersList[i] || {};
        const isLead = (m.regNo && m.regNo.toUpperCase() === leadReg) || (m.email && m.email.toLowerCase() === leadEmail) || (i === 0 && !leadReg && !leadEmail);
        const role = isLead ? 'TEAM LEAD' : `MEMBER ${i + 1}`;

        rows.push([
          t.teamId || '',
          `"${(t.teamName || '').replace(/"/g, '""')}"`,
          `"${(t.track || 'DRAGON INTELLIGENCE (AI & ML)').replace(/"/g, '""')}"`,
          t.payment?.status || 'PENDING',
          t.payment?.utr || '',
          t.payment?.amount || 0,
          t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
          `Member ${i + 1}`,
          role,
          `"${(m.name || '').replace(/"/g, '""')}"`,
          m.regNo || '',
          m.email || (m.regNo ? `${m.regNo.toLowerCase()}@klu.ac.in` : ''),
          m.department || '',
          m.year || '',
          `"${(m.section || '').replace(/"/g, '""')}"`,
          m.mobile || '',
          m.gender || '',
          m.accommodation || '',
          m.accommodation === 'Hosteller' ? (m.hostel || 'N/A') : 'N/A',
          m.accommodation === 'Hosteller' ? (m.roomNumber || 'N/A') : 'N/A'
        ]);
      }
    });

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ALPHA_Teams_Complete_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel (.xls formatted HTML table with all team & teammate details)
  const exportExcel = () => {
    if (filteredTeams.length === 0) {
      alert('No teams to export');
      return;
    }

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8"/>
        <title>ALPHA 2026 Teams Report</title>
        <style>
          th { background-color: #030712; color: #00f0ff; font-weight: bold; border: 1px solid #1e293b; padding: 6px; }
          td { border: 1px solid #cbd5e1; padding: 5px; font-family: Arial, sans-serif; font-size: 11px; }
          .lead-row { background-color: #f0fdf4; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>ALPHA 2026 - COMPLETE TEAMS & PARTICIPANTS EXCEL SHEET</h2>
        <p>KARE IEEE Education Society Student Chapter | Total Teams: ${filteredTeams.length}</p>
        <table border="1">
          <tr style="background-color: #030712; color: #00f0ff; font-weight: bold;">
            <th>Team ID</th><th>Team Name</th><th>Track</th><th>Status</th><th>UTR Number</th><th>Amount (INR)</th><th>Reg Date</th>
            <th>Member #</th><th>Role</th><th>Member Name</th><th>Reg No</th><th>Email</th><th>Department</th><th>Year</th><th>Section</th><th>Mobile</th><th>Gender</th><th>Accommodation</th><th>Hostel</th><th>Room Number</th>
          </tr>
          ${filteredTeams.map(t => {
            const membersList = (t.members && t.members.length > 0) ? t.members : [];
            const totalSlots = Math.max(4, membersList.length);
            const leadReg = (t.leadRegNo || '').toUpperCase();
            const leadEmail = (t.leadEmail || '').toLowerCase();

            return Array.from({ length: totalSlots }, (_, i) => {
              const m = membersList[i] || {};
              const isLead = (m.regNo && m.regNo.toUpperCase() === leadReg) || (m.email && m.email.toLowerCase() === leadEmail) || (i === 0 && !leadReg && !leadEmail);
              return `
                <tr ${isLead ? 'style="background-color: #f8fafc;"' : ''}>
                  <td>${t.teamId || ''}</td>
                  <td>${t.teamName || ''}</td>
                  <td>${t.track || 'DRAGON INTELLIGENCE (AI & ML)'}</td>
                  <td>${t.payment?.status || 'PENDING'}</td>
                  <td>${t.payment?.utr || ''}</td>
                  <td>${t.payment?.amount || 0}</td>
                  <td>${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}</td>
                  <td>Member ${i + 1}</td>
                  <td style="${isLead ? 'color: #b45309; font-weight: bold;' : ''}">${isLead ? 'TEAM LEAD' : 'MEMBER'}</td>
                  <td>${m.name || ''}</td>
                  <td>${m.regNo || ''}</td>
                  <td>${m.email || (m.regNo ? `${m.regNo.toLowerCase()}@klu.ac.in` : '')}</td>
                  <td>${m.department || ''}</td>
                  <td>${m.year || ''}</td>
                  <td>${m.section || ''}</td>
                  <td>${m.mobile || ''}</td>
                  <td>${m.gender || ''}</td>
                  <td>${m.accommodation || ''}</td>
                  <td>${m.accommodation === 'Hosteller' ? (m.hostel || 'N/A') : 'N/A'}</td>
                  <td>${m.accommodation === 'Hosteller' ? (m.roomNumber || 'N/A') : 'N/A'}</td>
                </tr>
              `;
            }).join('');
          }).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ALPHA_Teams_Complete_Excel_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct Create & Download Styled PDF Report (Light Clean Theme with Merged 4-Row Team Columns)
  const downloadDirectPDF = () => {
    if (filteredTeams.length === 0) {
      alert('No teams to export');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a3'
    });

    // Top Header Banner (Executive Royal Navy)
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, doc.internal.pageSize.width, 68, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('ALPHA 2026 - OFFICIAL TEAMS & PARTICIPANTS MASTER REPORT', 40, 30);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(10);
    doc.text(`KARE IEEE Education Society Student Chapter | Total Teams: ${filteredTeams.length} | Generated: ${new Date().toLocaleString()}`, 40, 50);

    // Table Headers
    const tableHeaders = [
      ['Team ID', 'Team Name', 'Track / Domain', 'Payment Status', 'UTR / TXN ID', 'Fee (₹)', 'Member #', 'Role', 'Full Name', 'Reg No', 'Student Email', 'Dept', 'Yr', 'Sec', 'Mobile', 'Gender', 'Stay', 'Hostel & Room']
    ];

    // Table Rows with Merged Team Columns (rowSpan: 4)
    const tableRows = [];
    filteredTeams.forEach((t) => {
      const membersList = (t.members && t.members.length > 0) ? t.members : [];
      const totalSlots = Math.max(4, membersList.length);
      const leadReg = (t.leadRegNo || '').toUpperCase();
      const leadEmail = (t.leadEmail || '').toLowerCase();

      for (let i = 0; i < totalSlots; i++) {
        const m = membersList[i] || {};
        const isLead = (m.regNo && m.regNo.toUpperCase() === leadReg) || (m.email && m.email.toLowerCase() === leadEmail) || (i === 0 && !leadReg && !leadEmail);
        const role = isLead ? '★ TEAM LEAD' : `MEMBER ${i + 1}`;
        const stay = m.accommodation || 'Day Scholar';
        const hostelInfo = stay === 'Hosteller' ? `${m.hostel || 'Hostel'} - Rm ${m.roomNumber || '-'}` : 'Day Scholar';

        const memberCells = [
          `Member ${i + 1}`,
          {
            content: role,
            styles: {
              fontStyle: isLead ? 'bold' : 'normal',
              textColor: isLead ? [180, 83, 9] : [71, 85, 105],
              fillColor: isLead ? [254, 243, 199] : (i % 2 === 0 ? [255, 255, 255] : [248, 250, 252])
            }
          },
          { content: m.name || '-', styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
          { content: m.regNo || '-', styles: { fontStyle: 'bold', textColor: [2, 132, 199] } },
          m.email || (m.regNo ? `${m.regNo.toLowerCase()}@klu.ac.in` : '-'),
          m.department || '-',
          m.year || '-',
          m.section || '-',
          m.mobile || '-',
          m.gender || '-',
          stay,
          hostelInfo
        ];

        if (i === 0) {
          // First row of team: include merged team columns with rowSpan
          const statusBg = t.payment?.status === 'VERIFIED' ? [236, 253, 245] : t.payment?.status === 'REJECTED' ? [254, 242, 242] : [254, 243, 199];
          const statusText = t.payment?.status === 'VERIFIED' ? [5, 150, 105] : t.payment?.status === 'REJECTED' ? [220, 38, 38] : [180, 83, 9];

          tableRows.push([
            {
              content: t.teamId || '',
              rowSpan: totalSlots,
              styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [2, 132, 199], fontSize: 9 }
            },
            {
              content: t.teamName || '',
              rowSpan: totalSlots,
              styles: { valign: 'middle', fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [15, 23, 42], fontSize: 9 }
            },
            {
              content: t.track || 'DRAGON INTELLIGENCE (AI & ML)',
              rowSpan: totalSlots,
              styles: { valign: 'middle', fillColor: [248, 250, 252], textColor: [71, 85, 105], fontSize: 7.5 }
            },
            {
              content: t.payment?.status || 'PENDING',
              rowSpan: totalSlots,
              styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', fillColor: statusBg, textColor: statusText }
            },
            {
              content: t.payment?.utr || 'N/A',
              rowSpan: totalSlots,
              styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [15, 23, 42] }
            },
            {
              content: `₹${t.payment?.amount !== undefined ? t.payment.amount : 1400}`,
              rowSpan: totalSlots,
              styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [5, 150, 105] }
            },
            ...memberCells
          ]);
        } else {
          // Subsequent teammate rows in the same team
          tableRows.push(memberCells);
        }
      }
    });

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 78,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4,
        textColor: [30, 41, 59],
        fillColor: [255, 255, 255],
        lineColor: [203, 213, 225],
        lineWidth: 0.5,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount} - ALPHA 2026 IEEE Official Master Report`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 12,
          { align: 'center' }
        );
      }
    });

    doc.save(`ALPHA_2026_Teams_Master_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading && !analytics) {
    return (
      <div className="p-20 text-center text-slate-400 space-y-4">
        <RefreshCw className="w-10 h-10 text-red-500 animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
          LOADING ALPHA ADMIN CONTROL CENTER...
        </p>
      </div>
    );
  }

  const stats = analytics?.stats || {
    totalTeams: teams.length,
    confirmedTeams: teams.filter(t => t.payment?.status === 'VERIFIED').length,
    activeReservations: 0,
    availableSlots: Math.max(0, 60 - teams.length),
    totalParticipants: computedDemographics.totalParticipants,
    pendingCount: teams.filter(t => t.payment?.status === 'PENDING').length,
    verifiedCount: teams.filter(t => t.payment?.status === 'VERIFIED').length,
    rejectedCount: teams.filter(t => t.payment?.status === 'REJECTED').length
  };

  // Helper for dynamic SVG Donut rendering
  const renderDonutSVG = (slices, total) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius; // ~238.76
    const safeTotal = total > 0 ? total : slices.reduce((acc, s) => acc + s.count, 0);

    if (safeTotal === 0) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r={radius} stroke="#1e293b" strokeWidth="12" fill="none" />
        </svg>
      );
    }

    let cumulativeOffset = 0;
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        <circle cx="50" cy="50" r={radius} stroke="#1e293b" strokeWidth="12" fill="none" />
        {slices.map((slice, idx) => {
          const sliceLen = (slice.count / safeTotal) * circumference;
          const offset = cumulativeOffset;
          cumulativeOffset += sliceLen;
          return (
            <circle
              key={idx}
              cx="50"
              cy="50"
              r={radius}
              stroke={slice.color}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${sliceLen} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* ============================================================== */}
      {/* 1. TOP SUBHEADER & ACTION BUTTONS (Exact match to Reference) */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950/50 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>ALPHA CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
            ADMIN DASHBOARD
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* TEAMS Tab Button */}
          <button
            onClick={() => setActiveMainTab('teams')}
            className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeMainTab === 'teams'
                ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] border border-red-500'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300'
            }`}
          >
            TEAMS ({stats.totalTeams || teams.length})
          </button>

          {/* SETTINGS Tab Button */}
          <button
            onClick={() => setActiveMainTab('settings')}
            className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'settings'
                ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] border border-red-500'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>SETTINGS</span>
          </button>

          {/* LOCK / UNLOCK Button */}
          <button
            onClick={handleToggleLock}
            className="px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* TOTAL TEAMS */}
        <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">TOTAL TEAMS</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{stats.totalTeams}</div>
        </div>

        {/* CONFIRMED */}
        <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">CONFIRMED</span>
          <div className="text-2xl font-black text-blue-500 font-mono mt-1">{stats.confirmedTeams}</div>
        </div>

        {/* RESERVATIONS */}
        <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">RESERVATIONS</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{stats.activeReservations || 0}</div>
        </div>

        {/* AVAILABLE */}
        <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">AVAILABLE</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats.availableSlots}</div>
        </div>

        {/* PARTICIPANTS */}
        <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">PARTICIPANTS</span>
          <div className="text-2xl font-black text-fuchsia-400 font-mono mt-1">{stats.totalParticipants}</div>
        </div>

        {/* PENDING */}
        <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">PENDING</span>
          <div className="text-2xl font-black text-yellow-400 font-mono mt-1">{stats.pendingCount}</div>
        </div>

        {/* VERIFIED */}
        <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">VERIFIED</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats.verifiedCount}</div>
        </div>

        {/* REJECTED */}
        <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 shadow-md">
          <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">REJECTED</span>
          <div className="text-2xl font-black text-rose-500 font-mono mt-1">{stats.rejectedCount}</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB VIEW 1: GLOBAL HACKATHON SETTINGS */}
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
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  }`}
                >
                  {settingsForm.registrationOpen ? 'REGISTRATIONS OPEN' : 'REGISTRATIONS CLOSED'}
                </button>
              </div>
            </div>

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

            <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">↑</span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      OFFICIAL UPI QR SCANNER IMAGE
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Upload your official UPI QR scanner. Displayed directly on the payment portal.
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:from-red-500 hover:to-rose-400 transition-all cursor-pointer"
            >
              {savingSettings ? 'SAVING CONFIGURATION...' : 'SAVE SYSTEM CONFIGURATION'}
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB VIEW 2: TEAMS & DEMOGRAPHICS (Exact match to Reference) */}
      {/* ============================================================== */}
      {activeMainTab === 'teams' && (
        <>
          {/* 3. REGISTRATION DEMOGRAPHICS ANALYTICS */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-red-500" />
                <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  REGISTRATION DEMOGRAPHICS ANALYTICS
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-red-950/40 border border-red-500/50 text-red-400 text-[10px] font-black uppercase">
                  {computedDemographics.totalParticipants} PARTICIPANTS ({stats.totalTeams} TEAMS)
                </span>
              </div>

              <button
                onClick={() => setShowCharts(!showCharts)}
                className="text-[10px] font-extrabold text-slate-300 hover:text-white uppercase tracking-wider flex items-center gap-1 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full cursor-pointer"
              >
                <span>{showCharts ? 'HIDE CHARTS ▲' : 'SHOW CHARTS ▼'}</span>
              </button>
            </div>

            {showCharts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Year Distribution */}
                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs">
                      🎓
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Year Distribution</h3>
                      <span className="text-[9px] text-slate-400 block font-medium">
                        {computedDemographics.totalParticipants} TOTAL PARTICIPANTS
                      </span>
                    </div>
                  </div>

                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    {renderDonutSVG(computedDemographics.year, computedDemographics.totalParticipants)}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-base font-black text-white font-mono">{computedDemographics.totalParticipants}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">STUDENTS</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                    {computedDemographics.year.map((item, idx) => {
                      const pct = computedDemographics.totalParticipants > 0
                        ? Math.round((item.count / computedDemographics.totalParticipants) * 100)
                        : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-400">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.label}
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {item.count} <span className="text-slate-500 font-normal">({pct}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Gender Distribution */}
                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-xs">
                      👥
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Gender Distribution</h3>
                      <span className="text-[9px] text-slate-400 block font-medium">
                        {computedDemographics.totalParticipants} TOTAL PARTICIPANTS
                      </span>
                    </div>
                  </div>

                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    {renderDonutSVG(computedDemographics.gender, computedDemographics.totalParticipants)}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-base font-black text-white font-mono">{computedDemographics.totalParticipants}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">STUDENTS</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                    {computedDemographics.gender.map((item, idx) => {
                      const pct = computedDemographics.totalParticipants > 0
                        ? Math.round((item.count / computedDemographics.totalParticipants) * 100)
                        : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-400">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.label}
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {item.count} <span className="text-slate-500 font-normal">({pct}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Department Distribution */}
                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs">
                      🏢
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Department Distribution</h3>
                      <span className="text-[9px] text-slate-400 block font-medium">
                        {computedDemographics.totalParticipants} TOTAL PARTICIPANTS
                      </span>
                    </div>
                  </div>

                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    {renderDonutSVG(computedDemographics.dept, computedDemographics.totalParticipants)}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-base font-black text-white font-mono">{computedDemographics.totalParticipants}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">STUDENTS</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                    {computedDemographics.dept.slice(0, 4).map((item, idx) => {
                      const pct = computedDemographics.totalParticipants > 0
                        ? Math.round((item.count / computedDemographics.totalParticipants) * 100)
                        : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-400">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.label}
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {item.count} <span className="text-slate-500 font-normal">({pct}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Accommodation */}
                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">
                      🏠
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Accommodation</h3>
                      <span className="text-[9px] text-slate-400 block font-medium">
                        {computedDemographics.totalParticipants} TOTAL PARTICIPANTS
                      </span>
                    </div>
                  </div>

                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    {renderDonutSVG(computedDemographics.accom, computedDemographics.totalParticipants)}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-base font-black text-white font-mono">{computedDemographics.totalParticipants}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">STUDENTS</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                    {computedDemographics.accom.map((item, idx) => {
                      const pct = computedDemographics.totalParticipants > 0
                        ? Math.round((item.count / computedDemographics.totalParticipants) * 100)
                        : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-400">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.label}
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {item.count} <span className="text-slate-500 font-normal">({pct}%)</span>
                          </span>
                        </div>
                      );
                    })}
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
                  className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer whitespace-nowrap uppercase"
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
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Years</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL', 'BIO'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={accomFilter}
                onChange={(e) => setAccomFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Accommodation</option>
                <option value="Hosteller">Hosteller</option>
                <option value="Day Scholar">Day Scholar</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0a0f1d] text-xs font-bold text-white border border-slate-800 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="DESC">Team ID Desc</option>
                <option value="ASC">Team ID Asc</option>
              </select>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={exportExcel}
                className="px-4 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-extrabold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Export Excel with all team and teammate details (4 rows per team)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>EXCEL (ALL DETAILS)</span>
              </button>

              <button
                onClick={exportCSV}
                className="px-4 py-1.5 rounded-full border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 text-xs font-extrabold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Export CSV with all team and teammate details (4 rows per team)"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>CSV (ALL DETAILS)</span>
              </button>

              <button
                onClick={downloadDirectPDF}
                className="px-4 py-1.5 rounded-full bg-slate-900 border border-amber-500/40 hover:bg-amber-950/30 text-amber-300 hover:text-amber-200 text-xs font-extrabold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Directly create and download official Master PDF Report"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>DOWNLOAD PDF (ALL DETAILS)</span>
              </button>

              <button
                onClick={() => setShowAllPassesModal(true)}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>ALL PASSES (PDF / PRINT)</span>
              </button>
            </div>
          </div>

          {/* 5. TEAMS DATA TABLE */}
          <div className="overflow-hidden rounded-3xl bg-[#0a0f1d] border border-slate-800/80 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070c18] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">TEAM ID {sortOrder === 'ASC' ? '↑' : '↓'}</th>
                    <th className="p-4">TEAM NAME</th>
                    <th className="p-4">TEAM LEAD</th>
                    <th className="p-4">UTR NUMBER</th>
                    <th className="p-4">STATUS</th>
                    <th className="p-4 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredTeams.map((t) => {
                    const leadMember = t.members?.find(
                      (m) =>
                        (m.regNo && m.regNo.toUpperCase() === (t.leadRegNo || '').toUpperCase()) ||
                        (m.email && m.email.toLowerCase() === (t.leadEmail || '').toLowerCase())
                    ) || t.members?.[0];
                    return (
                      <tr key={t._id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-4 font-mono font-black text-red-400 tracking-wider">
                          {t.teamId}
                        </td>

                        <td className="p-4 text-white font-extrabold uppercase">
                          {t.teamName}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span>{leadMember?.name || t.leadEmail?.split('@')[0]}</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black">LEAD</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {t.leadEmail} {t.leadRegNo ? `• ${t.leadRegNo}` : ''}
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
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-300 bg-slate-900/90 border border-slate-700 hover:border-cyan-400 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Ticket className="w-3 h-3 text-cyan-400" />
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
      {/* 6. INSPECT / AUDIT TEAM MODAL (Exact match to User Screenshot 1) */}
      {/* ============================================================== */}
      {inspectTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="max-w-3xl w-full p-6 md:p-8 rounded-3xl bg-[#090e1a] border border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto space-y-6 text-left animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block">
                  {inspectTeam.teamId}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                  {inspectTeam.teamName}
                </h2>
                
                {(() => {
                  const inspectLeadMember = inspectTeam.members?.find(
                    (m) =>
                      (m.regNo && m.regNo.toUpperCase() === (inspectTeam.leadRegNo || '').toUpperCase()) ||
                      (m.email && m.email.toLowerCase() === (inspectTeam.leadEmail || '').toLowerCase())
                  ) || inspectTeam.members?.[0];
                  return (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        <span>★ TEAM LEAD: {inspectLeadMember?.name || 'TEAM LEAD'} ({inspectTeam.leadRegNo || inspectLeadMember?.regNo || 'N/A'})</span>
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        • {inspectTeam.leadEmail || inspectLeadMember?.email}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenEdit(inspectTeam)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>EDIT TEAM</span>
                </button>

                <button
                  onClick={() => setInspectTeam(null)}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2-Column Body (Exact match to Screenshot 1) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: UTR & Screenshot Proof */}
              <div className="md:col-span-5 space-y-4">
                {/* UTR Box */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block">
                    UTR / TRANS REF NO:
                  </span>
                  <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/50 text-center shadow-inner">
                    <span className="text-lg md:text-xl font-black font-mono text-red-400 tracking-widest block select-all">
                      {inspectTeam.payment?.utr || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Screenshot Proof */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      CLOUDINARY SCREENSHOT PROOF:
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer">
                        <ImageIcon className="w-3 h-3" />
                        <span>Replace Proof</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReplaceInspectScreenshot}
                          className="hidden"
                        />
                      </label>
                      {(inspectTeam.payment?.screenshotUrl || inspectTeam.screenshotUrl) && (
                        <button
                          type="button"
                          onClick={() => setFullscreenImage(getScreenshotUrl(inspectTeam.payment?.screenshotUrl || inspectTeam.screenshotUrl))}
                          className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>Zoom</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2 rounded-2xl bg-black/60 border border-slate-800 flex items-center justify-center min-h-64 relative overflow-hidden group">
                    {(inspectTeam.payment?.screenshotUrl || inspectTeam.screenshotUrl) ? (
                      <div className="w-full text-center space-y-2">
                        <img
                          src={getScreenshotUrl(inspectTeam.payment?.screenshotUrl || inspectTeam.screenshotUrl)}
                          alt="Payment Screenshot Proof"
                          onClick={() => setFullscreenImage(getScreenshotUrl(inspectTeam.payment?.screenshotUrl || inspectTeam.screenshotUrl))}
                          className="w-full max-h-72 object-contain rounded-xl mx-auto shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.img-fallback-box');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <div className="img-fallback-box hidden p-6 text-center space-y-3">
                          <p className="text-xs font-bold text-amber-400">Preview image could not be loaded from previous server session.</p>
                          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-bold shadow-lg cursor-pointer hover:opacity-90 transition-opacity">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Upload / Attach Proof Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReplaceInspectScreenshot}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 space-y-2">
                        <p className="text-slate-500 text-xs font-bold">No Screenshot Attached</p>
                        <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold cursor-pointer transition-all">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Upload Screenshot</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReplaceInspectScreenshot}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Rejection Reason */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">
                    REJECTION REASON (IF REJECTING):
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Invalid UTR / duplicate transaction"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column: 4 Team Members List */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    {inspectTeam.members?.length || 4} TEAM MEMBERS:
                  </span>
                  <button
                    onClick={() => handleOpenEdit(inspectTeam)}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>EDIT</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {inspectTeam.members?.map((m, idx) => {
                    const isLead =
                      (m.regNo && m.regNo.toUpperCase() === (inspectTeam.leadRegNo || '').toUpperCase()) ||
                      (m.email && m.email.toLowerCase() === (inspectTeam.leadEmail || '').toLowerCase()) ||
                      (idx === 0 && !inspectTeam.leadRegNo && !inspectTeam.leadEmail);
                    return (
                      <div
                        key={m._id || idx}
                        className={`p-3.5 rounded-2xl text-xs space-y-1.5 transition-all ${
                          isLead
                            ? 'bg-red-950/20 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                            : 'bg-slate-900/70 border border-slate-800/90'
                        }`}
                      >
                        {/* Title & Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white uppercase">
                              {idx + 1}. {m.name} ({m.regNo})
                            </span>
                            {isLead && (
                              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[9px] uppercase tracking-wider">
                                ★ TEAM LEAD
                              </span>
                            )}
                          </div>
                          {isLead && (
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono">
                              (LEAD)
                            </span>
                          )}
                        </div>

                        {/* Subtitle Details: Dept, Year, Sec, Mobile */}
                        <div className="text-[11px] text-slate-300">
                          {m.department || 'CSE'} • Year {m.year || 'II'} • Sec: {m.section || '24SRS'} • <span className="font-mono text-slate-200">{m.mobile || 'N/A'}</span>
                        </div>

                        {/* Accommodation */}
                        <div className="text-[11px] text-slate-400">
                          Accomn: <span className="text-slate-200 font-semibold">{m.accommodation || 'Day Scholar'}{m.accommodation === 'Hosteller' && m.hostel ? ` (${m.hostel}${m.roomNumber ? ` / ${m.roomNumber}` : ''})` : ''}</span>
                        </div>
                      </div>
                    );
                  })}

                  {(!inspectTeam.members || inspectTeam.members.length === 0) && (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No member records found for this team.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer: 5 Buttons in Row (Exact match to Screenshot 1) */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. DELETE TEAM */}
                <button
                  onClick={() => handleDeleteTeam(inspectTeam)}
                  className="px-4 py-2.5 rounded-xl border border-red-500/50 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>DELETE TEAM</span>
                </button>

                {/* 2. EDIT TEAM DETAILS */}
                <button
                  onClick={() => handleOpenEdit(inspectTeam)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>EDIT TEAM DETAILS</span>
                </button>

                {/* 3. PASS (PDF) */}
                <button
                  onClick={() => {
                    setPassTeam(inspectTeam);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PASS (PDF)</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {/* 4. REJECT */}
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdatePaymentStatus(inspectTeam._id, 'REJECTED')}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all cursor-pointer"
                >
                  {actionLoading ? 'PROCESSING...' : 'REJECT'}
                </button>

                {/* 5. VERIFY */}
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdatePaymentStatus(inspectTeam._id, 'VERIFIED')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
                >
                  {actionLoading ? 'PROCESSING...' : 'VERIFY'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. FULLSCREEN SCREENSHOT LIGHTBOX */}
      {/* ============================================================== */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-red-600 transition-all cursor-pointer shadow-xl"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={fullscreenImage}
              alt="Payment Screenshot Zoom"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
            <div className="mt-3 flex items-center gap-3">
              <a
                href={fullscreenImage}
                download="payment-screenshot.png"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Proof</span>
              </a>
              <button
                onClick={() => setFullscreenImage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. ADD REGISTRATION MODAL (FULL TEAM + 4 MEMBERS) */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="max-w-2xl w-full p-6 rounded-3xl border border-red-500/40 bg-[#090e1a] shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-[#090e1a] z-10">
              <div>
                <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>+ DIRECT ADMIN TEAM REGISTRATION</span>
                </h2>
                <p className="text-[11px] text-slate-400">Register a complete 4-member team directly with instant verification</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRegistration} className="space-y-5 text-xs">
              {/* Section 1: Team & Track */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-3">
                <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block">
                  1. TEAM & TRACK SPECIFICATION
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">TEAM NAME *</label>
                    <input
                      type="text"
                      required
                      value={addForm.teamName}
                      onChange={(e) => setAddForm({ ...addForm, teamName: e.target.value.toUpperCase() })}
                      placeholder="e.g. INNOVAX / CYBER DRAGONS"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold uppercase focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">HACKATHON TRACK *</label>
                    <select
                      value={addForm.track}
                      onChange={(e) => setAddForm({ ...addForm, track: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-red-500 focus:outline-none"
                    >
                      <option value="DRAGON INTELLIGENCE (AI & ML)">DRAGON INTELLIGENCE (AI & ML)</option>
                      <option value="CYBERSECURITY & DEFENSE">CYBERSECURITY & DEFENSE</option>
                      <option value="WEB3 & DECENTRALIZED SYSTEMS">WEB3 & DECENTRALIZED SYSTEMS</option>
                      <option value="SMART IOT & HARDWARE">SMART IOT & HARDWARE</option>
                      <option value="OPEN INNOVATION & FINTECH">OPEN INNOVATION & FINTECH</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: 4 Team Members */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">
                    2. TEAM MEMBERS DETAILS (4 MEMBERS)
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Member 1 is Team Lead
                  </span>
                </div>

                {/* Member Tabs */}
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((idx) => {
                    const m = addForm.members[idx];
                    const isFilled = m?.name?.trim() && m?.regNo?.trim();
                    const isActive = activeAddMemberTab === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveAddMemberTab(idx)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-black uppercase transition-all cursor-pointer border text-center ${
                          isActive
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-md'
                            : isFilled
                            ? 'bg-slate-900 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {idx === 0 ? '★ 1. Lead' : `${idx + 1}. Member`}
                      </button>
                    );
                  })}
                </div>

                {/* Active Member Form Inputs */}
                {(() => {
                  const idx = activeAddMemberTab;
                  const currentMember = addForm.members[idx] || defaultAddMember;
                  const updateMember = (field, val) => {
                    const updated = [...addForm.members];
                    updated[idx] = { ...updated[idx], [field]: val };
                    if (field === 'regNo' && (!updated[idx].email || updated[idx].email.endsWith('@klu.ac.in'))) {
                      const cleanReg = val.trim().toLowerCase();
                      if (cleanReg) updated[idx].email = `${cleanReg}@klu.ac.in`;
                    }
                    setAddForm({ ...addForm, members: updated });
                  };

                  return (
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                        <span className="text-[11px] font-black text-slate-300">
                          {idx === 0 ? '★ MEMBER 1 (TEAM LEAD - PRIMARY CONTACT)' : `MEMBER ${idx + 1} DETAILS`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {idx === 0 ? 'Mandatory' : 'Optional / Standard'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-300 uppercase mb-1">
                            FULL NAME {idx === 0 ? '*' : ''}
                          </label>
                          <input
                            type="text"
                            required={idx === 0}
                            value={currentMember.name}
                            onChange={(e) => updateMember('name', e.target.value.toUpperCase())}
                            placeholder="e.g. POLANKI VYSHNAVI"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold uppercase focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-300 uppercase mb-1">
                            REGISTRATION NO {idx === 0 ? '*' : ''}
                          </label>
                          <input
                            type="text"
                            required={idx === 0}
                            value={currentMember.regNo}
                            onChange={(e) => updateMember('regNo', e.target.value.toUpperCase())}
                            placeholder="e.g. 9924008110"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-300 uppercase mb-1">DEPARTMENT</label>
                          <select
                            value={currentMember.department || 'CSE'}
                            onChange={(e) => updateMember('department', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-red-500 focus:outline-none"
                          >
                            {['CSE', 'ECE', 'IT', 'AI&DS', 'CS&IT', 'EEE', 'MECH', 'CIVIL'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-300 uppercase mb-1">YEAR</label>
                          <select
                            value={currentMember.year || 'III'}
                            onChange={(e) => updateMember('year', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-red-500 focus:outline-none"
                          >
                            <option value="I">I Year</option>
                            <option value="II">II Year</option>
                            <option value="III">III Year</option>
                            <option value="IV">IV Year</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-300 uppercase mb-1">SECTION</label>
                          <input
                            type="text"
                            value={currentMember.section || 'A'}
                            onChange={(e) => updateMember('section', e.target.value.toUpperCase())}
                            placeholder="24SRS"
                            className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-300 uppercase mb-1">MOBILE NUMBER</label>
                          <input
                            type="text"
                            value={currentMember.mobile}
                            onChange={(e) => updateMember('mobile', e.target.value)}
                            placeholder="9999999999"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-300 uppercase mb-1">COLLEGE EMAIL</label>
                          <input
                            type="email"
                            value={currentMember.email}
                            onChange={(e) => updateMember('email', e.target.value.toLowerCase())}
                            placeholder="student@klu.ac.in"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-300 uppercase mb-1">GENDER</label>
                          <select
                            value={currentMember.gender || 'Male'}
                            onChange={(e) => updateMember('gender', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-red-500 focus:outline-none"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-300 uppercase mb-1">ACCOMMODATION</label>
                          <select
                            value={currentMember.accommodation || 'Day Scholar'}
                            onChange={(e) => updateMember('accommodation', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-red-500 focus:outline-none"
                          >
                            <option value="Day Scholar">Day Scholar</option>
                            <option value="Hosteller">Hosteller</option>
                          </select>
                        </div>
                      </div>

                      {currentMember.accommodation === 'Hosteller' && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block font-bold text-slate-300 uppercase mb-1">HOSTEL NAME</label>
                            <input
                              type="text"
                              value={currentMember.hostel || ''}
                              onChange={(e) => updateMember('hostel', e.target.value.toUpperCase())}
                              placeholder="e.g. LH-2 / MH-1"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold uppercase focus:border-red-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-300 uppercase mb-1">ROOM NUMBER</label>
                            <input
                              type="text"
                              value={currentMember.roomNumber || ''}
                              onChange={(e) => updateMember('roomNumber', e.target.value.toUpperCase())}
                              placeholder="e.g. 310"
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold uppercase focus:border-red-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Section 3: Payment & Screenshot Proof */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-3">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">
                  3. PAYMENT DETAILS & SCREENSHOT PROOF
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">12-DIGIT UTR / REF NO</label>
                    <input
                      type="text"
                      value={addForm.utr}
                      onChange={(e) => setAddForm({ ...addForm, utr: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 528252926226"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">TOTAL AMOUNT (₹)</label>
                    <input
                      type="number"
                      value={addForm.amount}
                      onChange={(e) => setAddForm({ ...addForm, amount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">VERIFICATION STATUS</label>
                    <select
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-red-500 focus:outline-none"
                    >
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">
                    ATTACH PAYMENT SCREENSHOT (OPTIONAL)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setAddForm({ ...addForm, screenshotUrl: ev.target.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600/20 file:text-red-300 hover:file:bg-red-600/30 cursor-pointer"
                  />
                  {addForm.screenshotUrl && (
                    <div className="mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                      <img
                        src={addForm.screenshotUrl}
                        alt="Proof Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                      />
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Screenshot attached
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={addingReg}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs tracking-wider uppercase cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {addingReg ? 'REGISTERING TEAM...' : 'CONFIRM & REGISTER FULL TEAM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. EDIT TEAM MODAL */}
      {/* ============================================================== */}
      {editTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="max-w-4xl w-full p-6 md:p-8 rounded-3xl border border-amber-500/50 bg-[#090e1a] shadow-[0_0_60px_rgba(245,158,11,0.2)] space-y-6 text-left animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                    {editTeam.teamId}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    EDIT TEAM & ROSTER
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider mt-1">
                  EDIT TEAM DETAILS ({editTeam.teamId})
                </h2>
              </div>
              <button 
                onClick={() => setEditTeam(null)} 
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer hover:border-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-6 text-xs">
              
              {/* SECTION 1: Team & Registration Core Details */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                  1. TEAM INFORMATION & REGISTRATION STATUS
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">TEAM NAME *</label>
                    <input
                      type="text"
                      required
                      value={editForm.teamName}
                      onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-extrabold uppercase focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">TRACK / DOMAIN *</label>
                    <select
                      value={editForm.track}
                      onChange={(e) => setEditForm({ ...editForm, track: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold focus:outline-none focus:border-amber-400"
                    >
                      <option value="DRAGON INTELLIGENCE (AI & ML)">DRAGON INTELLIGENCE (AI & ML)</option>
                      <option value="CYBER DEFENSE & FORENSICS">CYBER DEFENSE & FORENSICS</option>
                      <option value="WEB3 & SMART CONTRACTS">WEB3 & SMART CONTRACTS</option>
                      <option value="DEEP TECH & HIGH PERFORMANCE">DEEP TECH & HIGH PERFORMANCE</option>
                      <option value="GENERAL INNOVATION & IOT">GENERAL INNOVATION & IOT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">PAYMENT STATUS</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-400"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">TOTAL AMOUNT (₹)</label>
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Read-Only Payment Proof (Admin CANNOT Edit UTR / Screenshot) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    2. PAYMENT PROOF & UTR (LOCKED - READ ONLY)
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    🔒 Admin cannot edit UTR number or screenshot
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">12-DIGIT UTR NUMBER</span>
                      <span className="font-mono text-white text-base font-black tracking-wider">
                        {editForm.utr || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 text-[10px] text-slate-400 font-bold">
                      <Lock className="w-3 h-3 text-amber-400" /> LOCKED
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {editForm.screenshotUrl ? (
                        <img
                          src={getScreenshotUrl(editForm.screenshotUrl)}
                          alt="Payment Proof"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-black cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setFullscreenImage(getScreenshotUrl(editForm.screenshotUrl))}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                          No Img
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">PAYMENT SCREENSHOT</span>
                        {editForm.screenshotUrl ? (
                          <a
                            href={getScreenshotUrl(editForm.screenshotUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Open Full Image
                          </a>
                        ) : (
                          <span className="text-slate-500">No screenshot uploaded</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 text-[10px] text-slate-400 font-bold">
                      <Lock className="w-3 h-3 text-amber-400" /> LOCKED
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Change Team Lead Selector */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    3. CHANGE TEAM LEAD (CHOOSE LEADER)
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-bold">
                    Click any member to assign as Team Lead
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {editForm.members.map((m, idx) => {
                    const isLead = editForm.leadMemberIndex === idx;
                    const mName = m.name?.trim() || `Member ${idx + 1}`;
                    const mReg = m.regNo?.trim() || 'No RegNo';

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, leadMemberIndex: idx }))}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isLead
                            ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-white'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            MEMBER {idx + 1}
                          </span>
                          {isLead && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> LEAD
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs truncate uppercase text-white">
                          {mName}
                        </div>
                        <div className="text-[10px] font-mono text-cyan-300 truncate">
                          {mReg}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: Edit All Member Details (Tabs 1 to 4) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    4. EDIT TEAM MEMBER DETAILS
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Active Member: Member {activeEditMemberTab + 1}
                  </span>
                </div>

                {/* Member Tabs */}
                <div className="grid grid-cols-4 gap-2">
                  {editForm.members.map((m, idx) => {
                    const isLead = editForm.leadMemberIndex === idx;
                    const isActive = activeEditMemberTab === idx;
                    const label = m.name ? m.name.split(' ')[0] : `Member ${idx + 1}`;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveEditMemberTab(idx)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate uppercase ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-400 to-sky-300 text-black shadow-lg font-black'
                            : isLead
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {isLead && <Crown className="w-3.5 h-3.5 shrink-0 text-amber-400" />}
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Member Form Fields */}
                {(() => {
                  const currentMember = editForm.members[activeEditMemberTab] || {};
                  const isLead = editForm.leadMemberIndex === activeEditMemberTab;

                  return (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black flex items-center justify-center border border-cyan-500/30">
                            {activeEditMemberTab + 1}
                          </span>
                          <span className="font-black text-white uppercase text-sm">
                            MEMBER {activeEditMemberTab + 1} DETAILS
                          </span>
                          {isLead && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1">
                              <Crown className="w-3 h-3" /> OFFICIAL TEAM LEAD
                            </span>
                          )}
                        </div>

                        {!isLead && (
                          <button
                            type="button"
                            onClick={() => setEditForm(prev => ({ ...prev, leadMemberIndex: activeEditMemberTab }))}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Crown className="w-3 h-3" />
                            <span>MAKE THIS MEMBER LEAD</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {/* Name */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            FULL NAME (AUTO-CAPITALIZED) *
                          </label>
                          <input
                            type="text"
                            required
                            value={currentMember.name || ''}
                            onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'name', e.target.value.toUpperCase())}
                            placeholder="e.g. JOHN DOE"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold uppercase focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        {/* Reg No */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            REGISTRATION NUMBER *
                          </label>
                          <input
                            type="text"
                            required
                            value={currentMember.regNo || ''}
                            onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'regNo', e.target.value)}
                            placeholder="e.g. 99240040799"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold uppercase focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            STUDENT EMAIL *
                          </label>
                          <input
                            type="email"
                            required
                            value={currentMember.email || ''}
                            onChange={(e) => {
                              handleEditMemberChange(activeEditMemberTab, 'email', e.target.value.toLowerCase());
                              handleEditMemberChange(activeEditMemberTab, 'customEmail', true);
                            }}
                            placeholder="e.g. 99240040799@klu.ac.in"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        {/* Department */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            DEPARTMENT *
                          </label>
                          <select
                            value={currentMember.department || 'CSE'}
                            onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'department', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold focus:outline-none focus:border-cyan-400"
                          >
                            {['CSE', 'ECE', 'IT', 'AI&DS', 'EEE', 'MECH', 'CIVIL', 'BIO', 'OTHERS'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        {/* Year */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            YEAR *
                          </label>
                          <select
                            value={currentMember.year || 'III'}
                            onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'year', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold focus:outline-none focus:border-cyan-400"
                          >
                            <option value="I">I Year</option>
                            <option value="II">II Year</option>
                            <option value="III">III Year</option>
                            <option value="IV">IV Year</option>
                          </select>
                        </div>

                        {/* Section */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            SECTION *
                          </label>
                          <input
                            type="text"
                            value={currentMember.section || ''}
                            onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'section', e.target.value.toUpperCase())}
                            placeholder="e.g. 24S08"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold uppercase focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            MOBILE NUMBER *
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={currentMember.mobile || ''}
                            onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'mobile', e.target.value)}
                            placeholder="9876543210"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            GENDER *
                          </label>
                          <select
                            value={currentMember.gender || 'Male'}
                            onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'gender', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold focus:outline-none focus:border-cyan-400"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>

                        {/* Accommodation */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            ACCOMMODATION *
                          </label>
                          <select
                            value={currentMember.accommodation || 'Day Scholar'}
                            onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'accommodation', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold focus:outline-none focus:border-cyan-400"
                          >
                            <option value="Day Scholar">Day Scholar</option>
                            <option value="Hosteller">Hosteller</option>
                          </select>
                        </div>

                        {/* Hosteller Fields */}
                        {currentMember.accommodation === 'Hosteller' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                HOSTEL NAME *
                              </label>
                              <select
                                value={currentMember.hostel || ''}
                                onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'hostel', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold focus:outline-none focus:border-cyan-400"
                              >
                                <option value="N/A">Select Hostel</option>
                                <option value="LH-1">LH-1</option>
                                <option value="LH-2">LH-2</option>
                                <option value="LH-3">LH-3</option>
                                <option value="LH-4">LH-4</option>
                                <option value="MH-1">MH-1</option>
                                <option value="MH-2">MH-2</option>
                                <option value="MH-3">MH-3</option>
                                <option value="MH-4">MH-4</option>
                                <option value="MH-5">MH-5</option>
                                <option value="MH-6">MH-6</option>
                                <option value="MH-7">MH-7</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                ROOM NUMBER *
                              </label>
                              <input
                                type="text"
                                value={currentMember.roomNumber || ''}
                                onChange={(e) => handleEditMemberChange(activeEditMemberTab, 'roomNumber', e.target.value)}
                                placeholder="e.g. 302"
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditTeam(null)}
                  className="w-1/3 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={editingReg}
                  className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs tracking-wider uppercase cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editingReg ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>SAVING TEAM & ROSTER CHANGES...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SAVE ALL TEAM & MEMBER CHANGES</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. SINGLE PASS PREVIEW MODAL */}
      {/* ============================================================== */}
      {passTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="max-w-4xl w-full p-4 md:p-6 rounded-3xl bg-[#090e1a] border border-cyan-500/40 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                OFFICIAL ADMISSION PASS PREVIEW ({passTeam.teamId})
              </span>
              <button
                onClick={() => setPassTeam(null)}
                className="p-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <OfficialEventPass
              team={passTeam}
              members={passTeam.members || []}
              payment={passTeam.payment || {}}
              eventSettings={analytics?.settings || settings}
              showActions={true}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. ALL PASSES PRINT MODAL */}
      {/* ============================================================== */}
      {showAllPassesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="max-w-5xl w-full p-6 rounded-3xl bg-[#090e1a] border border-red-500/40 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-[#090e1a] z-20 no-print">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  ALL PASSES PRINT / EXPORT ({filteredTeams.length} TEAMS)
                </h2>
                <p className="text-xs text-slate-400">
                  Ready to print all passes in high resolution. Each pass automatically formats to a single page.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT ALL PASSES</span>
                </button>
                <button
                  onClick={() => setShowAllPassesModal(false)}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {filteredTeams.map((t, idx) => (
                <div key={t._id || idx} className="page-break-after">
                  <OfficialEventPass
                    team={t}
                    members={t.members || []}
                    payment={t.payment || {}}
                    eventSettings={analytics?.settings || settings}
                    showActions={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* ============================================================== */}
      {/* 12. FULLSCREEN SCREENSHOT LIGHTBOX MODAL */}
      {/* ============================================================== */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-red-600 transition-all cursor-pointer shadow-xl"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={fullscreenImage}
              alt="Payment Screenshot Zoom"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
            <div className="mt-3 flex items-center gap-3">
              <a
                href={fullscreenImage}
                download="payment-screenshot.png"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Proof</span>
              </a>
              <button
                onClick={() => setFullscreenImage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
