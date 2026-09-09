import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, CheckCircle, Clock, ShieldCheck, Lock, Unlock,
  Plus, Settings, FileSpreadsheet, UserPlus, RefreshCw, Activity,
  ArrowUpRight, BarChart3, PieChart, TrendingUp, Calendar, Filter,
  AlertTriangle, ChevronRight, CheckSquare, Layers, Award, Sparkles
} from 'lucide-react';
import { TiltCard } from '../common/TiltCard';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminDashboard = ({ onNavigateTab }) => {
  const { settings, fetchSettings } = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('entire'); // today, 7days, 30days, entire
  const [togglingReg, setTogglingReg] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('growth'); // growth, status, department, sessions
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleToggleRegistration = async () => {
    try {
      setTogglingReg(true);
      const currentStatus = data?.settings?.registrationOpen !== false;
      const newStatus = !currentStatus;

      await axios.put('/api/settings', {
        registrationOpen: newStatus
      });

      await fetchSettings();
      await fetchAnalytics();
    } catch (err) {
      alert('Failed to update registration status: ' + (err.response?.data?.message || err.message));
    } finally {
      setTogglingReg(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">INITIALIZING EVENT COMMAND CENTER & ANALYTICS...</p>
      </div>
    );
  }

  const { stats, dailyGrowth, departmentBreakdown, yearBreakdown, workflowStages, sessionProgress, recentActivity } = data;
  const isRegOpen = data.settings?.registrationOpen !== false;

  // Filter daily growth data based on selected date filter
  const filteredDailyGrowth = (() => {
    if (!dailyGrowth || dailyGrowth.length === 0) return [];
    if (dateFilter === 'today') return dailyGrowth.slice(-1);
    if (dateFilter === '7days') return dailyGrowth.slice(-7);
    if (dateFilter === '30days') return dailyGrowth.slice(-14);
    return dailyGrowth;
  })();

  // SVG Line Chart Max Calculation
  const maxTeamsValue = Math.max(...filteredDailyGrowth.map(d => d.teams), 5);
  const chartHeight = 160;
  const chartWidth = 600;

  // Generate SVG path for registration growth line chart
  const points = filteredDailyGrowth.map((d, index) => {
    const x = (index / Math.max(1, filteredDailyGrowth.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (d.teams / maxTeamsValue) * (chartHeight - 30) - 15;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - 10} L ${points[0].x} ${chartHeight - 10} Z`
    : '';

  // SVG Donut Chart Calculation
  const verifiedCount = stats.verifiedTeams || 0;
  const pendingCount = stats.pendingRegistrations || 0;
  const rejectedCount = stats.rejectedTeams || 0;
  const totalChartStatus = Math.max(1, verifiedCount + pendingCount + rejectedCount);

  const verifiedPct = Math.round((verifiedCount / totalChartStatus) * 100);
  const pendingPct = Math.round((pendingCount / totalChartStatus) * 100);
  const rejectedPct = Math.round((rejectedCount / totalChartStatus) * 100);

  return (
    <div className="space-y-8">
      
      {/* 1. TOP QUICK ACTIONS BAR */}
      <div className="p-4 rounded-3xl glass-card border border-sky-500/20 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white tracking-wider uppercase">COMMAND CENTER QUICK ACTIONS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab && onNavigateTab('sessions')}
            className="px-3.5 py-1.5 rounded-xl glass-button text-xs font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Session</span>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('students')}
            className="px-3.5 py-1.5 rounded-xl glass-button text-xs font-bold text-sky-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Participants</span>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('volunteers')}
            className="px-3.5 py-1.5 rounded-xl glass-button text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Manage Volunteers</span>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('registration')}
            className="px-3.5 py-1.5 rounded-xl glass-button text-xs font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Open/Close Registration</span>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('records')}
            className="px-3.5 py-1.5 rounded-xl glass-button text-xs font-bold text-indigo-300 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Reports CSV</span>
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW STATISTIC CARDS (8 Compact Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Registrations */}
        <TiltCard className="p-4 rounded-2xl glass-card border border-sky-500/20 bg-slate-950/80 hover:border-sky-400/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL REGISTRATIONS</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.totalRegistrations}</div>
          <p className="text-[10px] text-sky-300 font-medium mt-1">Cap Limit: {data.settings?.maxTeams} Teams</p>
        </TiltCard>

        {/* Card 2: Confirmed Participants */}
        <TiltCard className="p-4 rounded-2xl glass-card border border-emerald-500/20 bg-slate-950/80 hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CONFIRMED PARTICIPANTS</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono text-glow">{stats.confirmedParticipants}</div>
          <p className="text-[10px] text-emerald-400 font-medium mt-1">{stats.verifiedTeams} Verified Teams</p>
        </TiltCard>

        {/* Card 3: Pending Registrations */}
        <TiltCard className="p-4 rounded-2xl glass-card border border-amber-500/20 bg-slate-950/80 hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PENDING REGISTRATIONS</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{stats.pendingRegistrations}</div>
          <p className="text-[10px] text-amber-400 font-medium mt-1">Awaiting Admin Verification</p>
        </TiltCard>

        {/* Card 4: Total Teams */}
        <TiltCard className="p-4 rounded-2xl glass-card border border-cyan-500/20 bg-slate-950/80 hover:border-cyan-400/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL TEAMS</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.totalTeams}</div>
          <p className="text-[10px] text-cyan-300 font-medium mt-1">Avg 4 Members / Team</p>
        </TiltCard>

        {/* Card 5: Total Participants */}
        <TiltCard className="p-4 rounded-2xl glass-card border border-indigo-500/20 bg-slate-950/80 hover:border-indigo-400/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL PARTICIPANTS</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.totalParticipants}</div>
          <p className="text-[10px] text-indigo-300 font-medium mt-1">Registered Student Roster</p>
        </TiltCard>

        {/* Card 6: Present Participants */}
        <TiltCard className="p-4 rounded-2xl glass-card border border-teal-500/20 bg-slate-950/80 hover:border-teal-400/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PRESENT PARTICIPANTS</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-300 font-mono">{stats.presentParticipants}</div>
          <p className="text-[10px] text-teal-400 font-medium mt-1">Live Scanned at Venue</p>
        </TiltCard>

        {/* Card 7: Attendance Percentage */}
        <TiltCard className="p-4 rounded-2xl glass-card border border-rose-500/20 bg-slate-950/80 hover:border-rose-400/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ATTENDANCE RATE</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono">{stats.attendancePercentage}%</div>
          <p className="text-[10px] text-rose-400 font-medium mt-1">Overall Participation Rate</p>
        </TiltCard>

        {/* Card 8: Registration Status */}
        <TiltCard className={`p-4 rounded-2xl glass-card border ${isRegOpen ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-red-500/40 bg-red-950/20'} transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REGISTRATION STATUS</span>
            <div className={`p-2 rounded-xl ${isRegOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {isRegOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-xl font-black ${isRegOpen ? 'text-emerald-300' : 'text-red-400'}`}>
            {isRegOpen ? '🟢 OPEN' : '🔴 CLOSED'}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Public Registration Controls</p>
        </TiltCard>

      </div>

      {/* 3. EVENT WORKFLOW PIPELINE (Clickable 8-Stage Timeline) */}
      <div className="p-6 rounded-3xl glass-card border border-sky-500/30 bg-slate-950/90 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5" />
              <span>EVENT LIFECYCLE PIPELINE</span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">Interactive Event Workflow Stages</h2>
          </div>
          <span className="text-[11px] text-slate-400">Click any stage to inspect relevant participant records</span>
        </div>

        {/* Workflow Pipeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {workflowStages.map((stage, idx) => (
            <button
              key={stage.id}
              onClick={() => onNavigateTab && onNavigateTab('students')}
              className="p-3 rounded-2xl glass-card border border-slate-800 hover:border-cyan-400/50 bg-slate-900/60 hover:bg-slate-900 transition-all text-left group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono font-bold text-cyan-400">0{idx + 1}</span>
                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-300 transition-colors" />
              </div>

              <div className="text-lg font-black text-white font-mono group-hover:text-cyan-300 transition-colors">
                {stage.count}
              </div>

              <div className="text-[10px] font-extrabold text-slate-300 tracking-wider uppercase mt-0.5 line-clamp-1">
                {stage.name}
              </div>

              <span className="text-[9px] text-slate-500 block mt-1 line-clamp-1">
                {stage.label}
              </span>

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* 4. EVENT ANALYTICS & CHARTS SECTION */}
      <div className="p-6 rounded-3xl glass-card border border-sky-500/20 bg-slate-950/80 shadow-2xl space-y-6">
        
        {/* Analytics Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-[10px] font-bold text-sky-300 uppercase tracking-widest mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>REAL BACKEND EVENT ANALYTICS</span>
            </div>
            <h2 className="text-xl font-black text-white">Visual Performance & Growth Charts</h2>
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2 hidden sm:inline">RANGE:</span>
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'entire', label: 'Entire Event' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id)}
                className={`px-3 py-1 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  dateFilter === f.id
                    ? 'bg-cyan-400 text-black font-extrabold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View Selector Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 overflow-x-auto">
          {[
            { id: 'growth', label: 'Registration Growth Trend', icon: TrendingUp },
            { id: 'status', label: 'Registration Status Breakdown', icon: PieChart },
            { id: 'department', label: 'Department Distribution', icon: BarChart3 },
            { id: 'sessions', label: 'Session Attendance Progress', icon: CheckSquare }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeChartTab === tab.id
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CHART DISPLAY PANEL */}
        <div className="pt-2">
          
          {/* Chart 1: Registration Growth Trend */}
          {activeChartTab === 'growth' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">DAILY TEAMS REGISTRATION GROWTH</span>
                <span className="text-cyan-400 font-mono text-[11px]">Hover over data nodes for exact daily values</span>
              </div>

              <div className="relative w-full overflow-x-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#1e293b" strokeDasharray="4 4" />
                  <line x1="20" y1={chartHeight / 2} x2={chartWidth - 20} y2={chartHeight / 2} stroke="#1e293b" strokeDasharray="4 4" />
                  <line x1="20" y1={chartHeight - 10} x2={chartWidth - 20} y2={chartHeight - 10} stroke="#334155" />

                  {/* Gradient Area Fill */}
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {areaD && <path d={areaD} fill="url(#growthGradient)" />}
                  {pathD && <path d={pathD} fill="none" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />}

                  {/* Interactive Points */}
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPoint === idx ? "6" : "4"}
                        className="fill-cyan-400 stroke-slate-950 stroke-2 cursor-pointer transition-all hover:r-6"
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {hoveredPoint === idx && (
                        <g>
                          <rect
                            x={p.x - 45}
                            y={p.y - 35}
                            width="90"
                            height="24"
                            rx="6"
                            className="fill-slate-950 stroke-cyan-400 stroke-1"
                          />
                          <text
                            x={p.x}
                            y={p.y - 20}
                            textAnchor="middle"
                            className="fill-cyan-300 text-[10px] font-bold font-mono"
                          >
                            {p.data.date}: {p.data.teams} Teams
                          </text>
                        </g>
                      )}
                    </g>
                  ))}
                </svg>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 px-2">
                  <span>{filteredDailyGrowth[0]?.date || 'Start'}</span>
                  <span>{filteredDailyGrowth[Math.floor(filteredDailyGrowth.length / 2)]?.date || 'Mid'}</span>
                  <span>{filteredDailyGrowth[filteredDailyGrowth.length - 1]?.date || 'Today'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Chart 2: Registration Status Breakdown */}
          {activeChartTab === 'status' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">REGISTRATION VERIFICATION STATUS</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="font-bold text-emerald-300">Verified Registrations</span>
                    </div>
                    <span className="font-mono font-black text-white">{verifiedCount} ({verifiedPct}%)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="font-bold text-amber-300">Pending Verification</span>
                    </div>
                    <span className="font-mono font-black text-white">{pendingCount} ({pendingPct}%)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="font-bold text-red-300">Rejected / Action Needed</span>
                    </div>
                    <span className="font-mono font-black text-white">{rejectedCount} ({rejectedPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Donut SVG Chart */}
              <div className="flex flex-col items-center justify-center p-4">
                <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="12" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${verifiedPct * 2.51} 251`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${pendingPct * 2.51} 251`}
                    strokeDashoffset={`-${verifiedPct * 2.51}`}
                  />
                </svg>
                <div className="text-center mt-2">
                  <span className="text-xl font-black text-white font-mono">{stats.totalRegistrations}</span>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Teams</span>
                </div>
              </div>
            </div>
          )}

          {/* Chart 3: Department Distribution */}
          {activeChartTab === 'department' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">STUDENT REGISTRATION BY DEPARTMENT</h3>
              <div className="space-y-3">
                {departmentBreakdown.map((dept, idx) => {
                  const pct = Math.round((dept.count / Math.max(1, stats.totalParticipants)) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-200">{dept.name}</span>
                        <span className="font-mono text-cyan-300 font-bold">{dept.count} Students ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chart 4: Session Attendance Progress */}
          {activeChartTab === 'sessions' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">SESSION-WISE PARTICIPATION PROGRESS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sessionProgress.map((sess) => (
                  <div key={sess._id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{sess.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sess.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-slate-800 text-slate-400'}`}>
                        {sess.status === 'OPEN' ? '🟢 OPEN' : '🔴 CLOSED'}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Present Count:</span>
                      <span className="font-mono font-bold text-cyan-300">{sess.presentCount} / {sess.expectedCount}</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, sess.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 5. SYNCHRONIZED REGISTRATION CONTROL CARD & RECENT ACTIVITY DUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Synced Registration Control Card */}
        <div className={`p-6 rounded-3xl glass-card border ${isRegOpen ? 'border-emerald-500/40 bg-emerald-950/10 shadow-[0_0_40px_rgba(16,185,129,0.15)]' : 'border-red-500/40 bg-red-950/10 shadow-[0_0_40px_rgba(239,68,68,0.15)]'} space-y-5`}>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>LIVE REGISTRATION CONTROL</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isRegOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}>
              {isRegOpen ? '🟢 ACTIVE' : '🔴 BLOCKED'}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black text-white uppercase">Public Registration Master Switch</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              When toggled OFF, public slot reservation and registration forms are immediately disabled across the app. Participant data in database remains 100% preserved.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">CURRENT STATUS</span>
              <span className={`text-base font-black ${isRegOpen ? 'text-emerald-300' : 'text-red-400'}`}>
                {isRegOpen ? 'REGISTRATION IS OPEN' : 'REGISTRATION IS CLOSED'}
              </span>
            </div>

            <button
              onClick={handleToggleRegistration}
              disabled={togglingReg}
              className={`px-5 py-3 rounded-xl text-xs font-extrabold tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
                isRegOpen
                  ? 'bg-red-500 hover:bg-red-400 text-white'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-black'
              }`}
            >
              {togglingReg ? (
                <span>SAVING STATUS...</span>
              ) : isRegOpen ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>CLOSE REGISTRATION</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>REOPEN REGISTRATION</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Audit Activity Stream */}
        <div className="p-6 rounded-3xl glass-card border border-sky-500/20 bg-slate-950/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>RECENT ADMINISTRATIVE ACTIVITY STREAM</span>
            </h3>
            <span className="text-[10px] text-slate-500">Live Audit Logs</span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-none">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-[11px]">{log.action}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-400/20 font-mono">{log.performedBy}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent administrative activities recorded.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
