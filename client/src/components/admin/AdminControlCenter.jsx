import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, CheckCircle, Calendar, ShieldCheck, Lock, Unlock,
  Plus, Settings, FileSpreadsheet, UserPlus, RefreshCw, Activity, ArrowUpRight, LogOut
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { TiltCard } from '../common/TiltCard';
import { AdminAttendanceSessions } from './AdminAttendanceSessions';
import { AdminVolunteers } from './AdminVolunteers';
import { AdminAttendanceRecords } from './AdminAttendanceRecords';
import { AdminStudentRegistrations } from './AdminStudentRegistrations';
import { AdminTeams } from './AdminTeams';
import { AdminSettings } from './AdminSettings';
import { AdminAnnouncements } from './AdminAnnouncements';

export const AdminControlCenter = () => {
  const { settings, fetchSettings } = useSettings();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, students, sessions, volunteers, records, registration, announcements, settings
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalStudents: 0,
    presentToday: 0,
    activeSessionName: 'None',
    activeSessionStatus: 'CLOSED',
    activeSessionPresent: 0,
    activeSessionExpected: 250,
    totalVolunteers: 0,
    volunteersOnline: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [teamsRes, sessRes, volRes, logsRes] = await Promise.all([
        axios.get('/api/admin/teams'),
        axios.get('/api/attendance/sessions'),
        axios.get('/api/volunteers'),
        axios.get('/api/attendance/logs')
      ]);

      const teamsData = teamsRes.data;
      const teams = Array.isArray(teamsData) ? teamsData : (teamsData?.teams || []);
      const totalStudents = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);
      const sessions = Array.isArray(sessRes.data) ? sessRes.data : [];
      const openSess = sessions.find(s => s.status === 'OPEN');
      const volunteers = Array.isArray(volRes.data) ? volRes.data : [];
      const activeVols = volunteers.filter(v => v.status === 'active');
      const logs = Array.isArray(logsRes.data?.logs) ? logsRes.data.logs : (Array.isArray(logsRes.data) ? logsRes.data : []);

      setStats({
        totalTeams: teams.length,
        totalStudents,
        presentToday: logs.length,
        activeSessionName: openSess ? openSess.name : 'None',
        activeSessionStatus: openSess ? 'OPEN' : 'CLOSED',
        activeSessionPresent: openSess ? (openSess.presentCount || 0) : 0,
        activeSessionExpected: openSess ? (openSess.expectedParticipants || 250) : 250,
        totalVolunteers: volunteers.length,
        volunteersOnline: activeVols.length
      });
    } catch (err) {
      console.error('Failed to load control center stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const isRegOpen = settings.registrationOpen !== false;

  return (
    <div className="space-y-8">
      
      {/* Admin Control Center Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>ADMINISTRATOR CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white">ALPHA 2026 EVENT MANAGEMENT</h1>
          <p className="text-xs text-slate-400 mt-1">Live registration control, session-wise attendance tracking, volunteer permissions & site configuration</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardStats}
            className="p-2.5 rounded-xl glass-button text-slate-300 hover:text-white"
            title="Refresh System Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {[
          { id: 'overview', label: 'Dashboard Overview' },
          { id: 'students', label: 'Student Registration Records' },
          { id: 'sessions', label: 'Attendance Sessions' },
          { id: 'volunteers', label: 'Volunteer Management' },
          { id: 'records', label: 'Attendance Records' },
          { id: 'registration', label: 'Registration Control' },
          { id: 'announcements', label: 'Announcements' },
          { id: 'settings', label: 'Event Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-400 to-sky-300 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Quick Actions Bar */}
          <div className="p-4 rounded-3xl glass-card border border-sky-500/20 bg-slate-950/80 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">QUICK ACTIONS:</span>
            <button
              onClick={() => setActiveTab('registration')}
              className="px-3.5 py-2 rounded-xl glass-button text-xs font-bold text-sky-300 flex items-center gap-1.5"
            >
              <span>Registration Control</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className="px-3.5 py-2 rounded-xl glass-button text-xs font-bold text-cyan-300 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Attendance Session</span>
            </button>

            <button
              onClick={() => setActiveTab('volunteers')}
              className="px-3.5 py-2 rounded-xl glass-button text-xs font-bold text-emerald-300 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Volunteer Account</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className="px-3.5 py-2 rounded-xl glass-button text-xs font-bold text-indigo-300 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Attendance CSV</span>
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TiltCard className="p-5 text-center flex flex-col items-center justify-center rounded-2xl glass-card border border-sky-500/20">
              <Users className="w-6 h-6 text-sky-400 mb-2" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">TOTAL REGISTRATIONS</span>
              <span className="text-xl font-black text-white mt-1">{stats.totalTeams} / {settings.maxTeams || 100}</span>
              <span className="text-[10px] text-cyan-300 mt-0.5">{stats.totalStudents} Students</span>
            </TiltCard>

            <TiltCard className="p-5 text-center flex flex-col items-center justify-center rounded-2xl glass-card border border-emerald-500/20">
              <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">PRESENT TODAY</span>
              <span className="text-xl font-black text-emerald-300 mt-1">{stats.presentToday}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Scanned Attendance</span>
            </TiltCard>

            <TiltCard className="p-5 text-center flex flex-col items-center justify-center rounded-2xl glass-card border border-cyan-500/20">
              <Calendar className="w-6 h-6 text-cyan-400 mb-2" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">ACTIVE SESSION</span>
              <span className="text-sm font-bold text-cyan-300 mt-1 line-clamp-1">{stats.activeSessionName}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${
                stats.activeSessionStatus === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {stats.activeSessionStatus === 'OPEN' ? '🟢 OPEN' : '🔒 CLOSED'}
              </span>
            </TiltCard>

            <TiltCard className="p-5 text-center flex flex-col items-center justify-center rounded-2xl glass-card border border-indigo-500/20">
              <UserPlus className="w-6 h-6 text-indigo-400 mb-2" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">VOLUNTEERS ACTIVE</span>
              <span className="text-xl font-black text-white mt-1">{stats.volunteersOnline} / {stats.totalVolunteers}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Authorized Operators</span>
            </TiltCard>
          </div>

          {/* Dual Control Overview: Registration & Attendance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Registration Summary Card */}
            <div className={`p-6 rounded-3xl glass-card border ${isRegOpen ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-red-500/40 bg-red-950/10'} shadow-xl space-y-4`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">REGISTRATION STATUS</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isRegOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}>
                  {isRegOpen ? '🟢 REGISTRATION OPEN' : '🔴 REGISTRATION CLOSED'}
                </span>
              </div>
              <h3 className="text-lg font-black text-white">Participant Team Registrations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isRegOpen
                  ? 'Participants are actively able to reserve slots and submit registrations.'
                  : 'New team registrations are currently blocked by the administrator.'}
              </p>
              <button
                onClick={() => setActiveTab('registration')}
                className="w-full py-3 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all"
              >
                Manage Registration Status & Capacity
              </button>
            </div>

            {/* Attendance Summary Card */}
            <div className={`p-6 rounded-3xl glass-card border ${stats.activeSessionStatus === 'OPEN' ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-sky-500/30 bg-slate-950/80'} shadow-xl space-y-4`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ATTENDANCE SESSION STATUS</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${stats.activeSessionStatus === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  {stats.activeSessionStatus === 'OPEN' ? '🟢 SESSION ACTIVE' : '🔒 ALL SESSIONS CLOSED'}
                </span>
              </div>
              <h3 className="text-lg font-black text-white">Active Session: {stats.activeSessionName}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {stats.activeSessionStatus === 'OPEN'
                  ? `Attendance scanning is currently enabled. Present count: ${stats.activeSessionPresent} / ${stats.activeSessionExpected}.`
                  : 'No attendance session is currently open. Volunteers are locked from taking attendance.'}
              </p>
              <button
                onClick={() => setActiveTab('sessions')}
                className="w-full py-3 text-xs font-bold text-slate-200 glass-button rounded-xl hover:text-white"
              >
                Manage Attendance Sessions & Open/Close Controls
              </button>
            </div>

          </div>

          {/* System Operational Status Indicator */}
          <div className="p-4 rounded-2xl glass-card border border-sky-500/20 bg-slate-950/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold text-white uppercase tracking-wider">SYSTEM STATUS: 🟢 OPERATIONAL</span>
                <p className="text-[10px] text-slate-400">Database connected, security guards active, QR scanner ready.</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:block">ALPHA 2026 v2.0</span>
          </div>

        </div>
      )}

      {/* SUB-TAB CONTENTS */}
      {activeTab === 'students' && <AdminStudentRegistrations />}
      {activeTab === 'teams' && <AdminStudentRegistrations />}
      {activeTab === 'sessions' && <AdminAttendanceSessions onRefresh={fetchDashboardStats} />}
      {activeTab === 'volunteers' && <AdminVolunteers onRefresh={fetchDashboardStats} />}
      {activeTab === 'records' && <AdminAttendanceRecords />}
      {activeTab === 'registration' && <AdminRegistrationControl stats={stats} onRefresh={fetchDashboardStats} />}
      {activeTab === 'announcements' && <AdminAnnouncements />}
      {activeTab === 'settings' && <AdminSettings />}

    </div>
  );
};
