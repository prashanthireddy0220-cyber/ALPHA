import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, CheckCircle, XCircle, Eye, ExternalLink, ShieldCheck, AlertCircle, Download, FileSpreadsheet } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [accomFilter, setAccomFilter] = useState('');

  // Selected Team Modal
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (deptFilter) params.department = deptFilter;
      if (yearFilter) params.year = yearFilter;
      if (accomFilter) params.accommodation = accomFilter;

      const res = await axios.get('/api/admin/teams', { params });
      setTeams(res.data || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [search, statusFilter, deptFilter, yearFilter, accomFilter]);

  const handleUpdatePayment = async (teamId, status) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/admin/teams/${teamId}/payment`, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : ''
      });
      setSelectedTeam(null);
      setRejectionReason('');
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  // Export Filtered Teams as CSV
  const exportCSV = () => {
    if (teams.length === 0) return;
    const headers = ['Team ID', 'Team Name', 'Track', 'Lead Email', 'UTR', 'Amount', 'Payment Status', 'Submitted At'];
    const rows = teams.map(t => [
      t.teamId,
      `"${t.teamName.replace(/"/g, '""')}"`,
      `"${(t.track || '').replace(/"/g, '""')}"`,
      t.leadEmail,
      t.payment?.utr || '',
      t.payment?.amount || 0,
      t.payment?.status || 'PENDING',
      t.createdAt ? new Date(t.createdAt).toISOString() : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ALPHA_Teams_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">TEAM & PAYMENT VERIFICATION</h1>
          <p className="text-xs text-slate-400">Search, audit member roster, verify payment screenshots & export data</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-3.5 py-1.5 text-xs font-bold text-black bg-cyan-300 hover:bg-cyan-200 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
          <div className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-400/30 px-3 py-1.5 rounded-xl">
            Total Found: {teams.length} Teams
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl glass-card border border-sky-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Team ID, Name, RegNo, UTR..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 text-xs text-white placeholder-slate-500 border border-slate-800 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 text-xs text-white border border-slate-800 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 text-xs text-white border border-slate-800 focus:outline-none"
        >
          <option value="">All Departments</option>
          {['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL', 'BIO', 'OTHERS'].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 text-xs text-white border border-slate-800 focus:outline-none"
        >
          <option value="">All Years</option>
          <option value="II">II Year</option>
          <option value="III">III Year</option>
          <option value="IV">IV Year</option>
        </select>

        <select
          value={accomFilter}
          onChange={(e) => setAccomFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 text-xs text-white border border-slate-800 focus:outline-none"
        >
          <option value="">All Accommodation</option>
          <option value="Day Scholar">Day Scholar</option>
          <option value="Hosteller">Hosteller</option>
        </select>
      </div>

      {/* Teams Table */}
      <div className="overflow-x-auto rounded-2xl glass-card border border-sky-500/20">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-sky-300 uppercase tracking-wider font-bold border-b border-slate-800">
            <tr>
              <th className="p-4">TEAM ID</th>
              <th className="p-4">TEAM NAME</th>
              <th className="p-4">LEAD REG NO</th>
              <th className="p-4">UTR NUMBER</th>
              <th className="p-4">AMOUNT</th>
              <th className="p-4">STATUS</th>
              <th className="p-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {teams.map((t) => (
              <tr key={t._id} className="hover:bg-slate-900/50 transition-colors">
                <td className="p-4 font-mono font-bold text-cyan-300">{t.teamId}</td>
                <td className="p-4 text-white font-bold">{t.teamName}</td>
                <td className="p-4 font-mono text-slate-300">{t.leadRegNo}</td>
                <td className="p-4 font-mono text-slate-300">{t.payment?.utr}</td>
                <td className="p-4 text-cyan-300 font-bold">₹{t.payment?.amount}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelectedTeam(t)}
                    className="px-3 py-1.5 text-xs font-bold text-sky-200 glass-button rounded-lg flex items-center gap-1.5 ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>AUDIT / VERIFY</span>
                  </button>
                </td>
              </tr>
            ))}
            {teams.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No registered teams match the selected query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="max-w-3xl w-full p-8 rounded-3xl glass-card border border-sky-500/40 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">AUDIT TEAM</span>
                <h2 className="text-xl font-black text-white">{selectedTeam.teamName} ({selectedTeam.teamId})</h2>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-white"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Member Details */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Team Members Roster</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {selectedTeam.members?.map((m, idx) => (
                  <div key={m._id || idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-white flex justify-between">
                      <span>{m.name}</span>
                      <span className="font-mono text-cyan-400">{m.regNo}</span>
                    </div>
                    <div className="text-slate-400">Dept: {m.department} | Yr: {m.year} | Sec: {m.section}</div>
                    <div className="text-slate-400">Mobile: {m.mobile} | {m.accommodation} {m.accommodation === 'Hosteller' ? `(${m.hostel} - Room ${m.roomNumber})` : ''}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details & Screenshot */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/20 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-sky-400 uppercase mb-2">Payment Details</h3>
                <div className="text-xs space-y-2 text-slate-300">
                  <p>UTR Number: <span className="font-mono font-bold text-white">{selectedTeam.payment?.utr}</span></p>
                  <p>Amount Paid: <span className="font-bold text-cyan-300">₹{selectedTeam.payment?.amount}</span></p>
                  <p>Status: <span className="font-bold text-amber-300">{selectedTeam.payment?.status}</span></p>
                </div>

                <div className="mt-4">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Rejection Reason (If rejecting)
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. UTR mismatch or screenshot unreadable"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-sky-400 uppercase mb-2">Payment Screenshot</h3>
                {selectedTeam.payment?.screenshotUrl ? (
                  <div className="space-y-2">
                    <img
                      src={selectedTeam.payment.screenshotUrl}
                      alt="Payment Screenshot"
                      className="w-full max-h-48 object-contain rounded-xl border border-slate-800 bg-black"
                    />
                    <a
                      href={selectedTeam.payment.screenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Open Full Image
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No screenshot file attached</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button
                disabled={actionLoading}
                onClick={() => handleUpdatePayment(selectedTeam._id, 'REJECTED')}
                className="w-1/2 py-3 text-xs font-bold text-red-300 bg-red-950/80 hover:bg-red-900 border border-red-500/40 rounded-xl"
              >
                REJECT PAYMENT
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleUpdatePayment(selectedTeam._id, 'VERIFIED')}
                className="w-1/2 py-3 text-xs font-extrabold text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg"
              >
                VERIFY & CONFIRM TEAM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
