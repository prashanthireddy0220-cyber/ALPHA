import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, CheckCircle, Calendar, ShieldCheck, Lock, Unlock,
  Plus, Settings, FileSpreadsheet, UserPlus, RefreshCw, Activity, ArrowUpRight, LogOut
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';
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
        <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
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
