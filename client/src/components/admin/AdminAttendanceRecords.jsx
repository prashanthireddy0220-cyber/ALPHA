import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, Trash2, Calendar, Filter, Users, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const AdminAttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessRes, recRes] = await Promise.all([
        axios.get('/api/attendance/sessions'),
        axios.get(`/api/attendance/logs${selectedSessionId ? `?sessionId=${selectedSessionId}` : ''}`)
      ]);
      setSessions(sessRes.data || []);
      setRecords(recRes.data?.logs || []);
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSessionId]);

  const handleDeleteRecord = async (id, studentName, sessionName) => {
    if (!window.confirm(`DELETE ATTENDANCE RECORD for "${studentName}" in "${sessionName}"?`)) return;
    try {
      await axios.delete(`/api/attendance/records/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete attendance record');
    }
  };

  const exportToCSV = () => {
    if (records.length === 0) {
      alert('No attendance records available to export.');
      return;
    }

    const headers = ['Session Name', 'Team ID', 'Registration No', 'Student Name', 'Department', 'Year', 'Scanned By Volunteer', 'Scanned Timestamp'];
    const rows = records.map(r => [
      `"${r.sessionName || ''}"`,
      `"${r.teamId || ''}"`,
      `"${r.regNo || ''}"`,
      `"${r.studentName || ''}"`,
      `"${r.department || 'CSE'}"`,
      `"${r.year || '3rd Year'}"`,
      `"${r.scannedByVolunteerName || 'Volunteer'}"`,
      `"${new Date(r.scannedAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ALPHA_Attendance_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      (r.studentName && r.studentName.toLowerCase().includes(q)) ||
      (r.regNo && r.regNo.toLowerCase().includes(q)) ||
      (r.teamId && r.teamId.toLowerCase().includes(q)) ||
      (r.sessionName && r.sessionName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">ATTENDANCE RECORDS & REPORTS</h2>
          <p className="text-xs text-slate-400 mt-1">
            View, search, filter, correct, and export session-wise participant attendance data.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-5 py-2.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>EXPORT ATTENDANCE (CSV)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <TiltCard className="p-4 rounded-2xl glass-card border border-sky-500/20 bg-slate-950/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400 w-full md:w-64"
          >
            <option value="">All Attendance Sessions</option>
            {sessions.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.date})</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Reg No, or Team ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-sky-500/30 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
          />
        </div>
      </TiltCard>

      {/* Records Table */}
      <TiltCard className="p-6 rounded-3xl glass-card border border-sky-500/20 bg-slate-950/80">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            ATTENDANCE ROSTER ({filteredRecords.length} Records)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Participant</th>
                <th className="pb-3">Reg No</th>
                <th className="pb-3">Team ID</th>
                <th className="pb-3">Session</th>
                <th className="pb-3">Scanned By</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((rec) => (
                <tr key={rec._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 font-bold text-white">
                    {rec.studentName}
                  </td>
                  <td className="py-3.5 font-mono font-bold text-cyan-300">
                    {rec.regNo}
                  </td>
                  <td className="py-3.5 font-mono text-slate-300">
                    {rec.teamId}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-400/30 text-[10px] font-semibold">
                      {rec.sessionName || 'Session'}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {rec.scannedByVolunteerName || 'Volunteer'}
                  </td>
                  <td className="py-3.5 text-slate-500 text-[11px]">
                    {new Date(rec.scannedAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteRecord(rec._id, rec.studentName, rec.sessionName)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                      title="Correct / Delete Attendance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 text-xs">
                    No attendance records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TiltCard>
    </div>
  );
};
