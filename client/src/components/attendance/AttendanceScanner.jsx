import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle, AlertTriangle, ShieldCheck, Camera, HelpCircle, CheckSquare } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const AttendanceScanner = ({ activeSession }) => {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [checkpoint, setCheckpoint] = useState('Check-in');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/attendance/logs');
      setLogs(res.data?.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const fetchHelpRequests = async () => {
    try {
      const res = await axios.get('/api/help/list');
      setHelpRequests(res.data || []);
    } catch (err) {
      console.error('Failed to load help requests:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchHelpRequests();

    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (error) => {}
    );

    return () => {
      scanner.clear().catch(err => console.error(err));
    };
  }, [checkpoint]);

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const handleScanSuccess = async (scannedText) => {
    setLoading(true);
    setErrorMessage('');
    setScanResult(null);

    let teamId = '';
    let regNo = '';

    const text = (scannedText || '').trim();

    if (text.includes('/verify/')) {
      const parts = text.split('/verify/')[1] || '';
      const cleanPath = parts.split('?')[0].split('#')[0].replace(/\/$/, '').trim();
      
      if (cleanPath.startsWith('ALPHA-')) {
        teamId = cleanPath;
      } else {
        regNo = cleanPath;
      }

      // Check query params for regNo
      try {
        const urlObj = new URL(text.startsWith('http') ? text : `http://dummy.com${text}`);
        const paramRegNo = urlObj.searchParams.get('regNo');
        if (paramRegNo) regNo = paramRegNo.trim();
      } catch (e) {}
    } else if (text.includes(':')) {
      const split = text.split(':');
      teamId = split[0].trim();
      regNo = split[1].trim();
    } else if (text.toUpperCase().startsWith('ALPHA-')) {
      teamId = text.toUpperCase();
    } else {
      regNo = text;
    }

    try {
      const res = await axios.post('/api/attendance/scan', {
        teamId,
        regNo,
        checkpoint,
        sessionId: activeSession?._id
      });
      setScanResult(res.data);
      playSuccessSound();
      fetchLogs();
    } catch (err) {
      if (err.response?.data?.alreadyMarked) {
        setScanResult({
          alreadyMarked: true,
          message: err.response.data.message,
          studentName: err.response.data.studentName,
          regNo: err.response.data.regNo,
          checkpoint: err.response.data.checkpoint,
          teamId: err.response.data.teamId,
          scannedAt: err.response.data.scannedAt
        });
      } else {
        setErrorMessage(err.response?.data?.message || 'Attendance scan failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScanSuccess(manualInput.trim());
    setManualInput('');
  };

  const resolveHelp = async (id) => {
    try {
      await axios.put(`/api/help/${id}/status`, { status: 'RESOLVED' });
      fetchHelpRequests();
    } catch (err) {
      alert('Failed to resolve help ticket');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-3">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>VOLUNTEER COMMAND & SCANNER PORTAL</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white">CHECKPOINT SCANNER</h1>
        <p className="text-xs text-slate-400 mt-1">Multi-device real-time QR scanner & volunteer helpdesk</p>
      </div>

      {/* Checkpoint Selection Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl glass-card border border-sky-500/20 max-w-2xl mx-auto">
        {['Check-in', 'Lunch', 'Hackathon Entry', 'Final Submission', 'Exit'].map((cp) => (
          <button
            key={cp}
            onClick={() => setCheckpoint(cp)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              checkpoint === cp
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.6)] font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cp}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scanner Feed Card */}
        <TiltCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>SCANNER ({checkpoint.toUpperCase()})</span>
            </h2>
            <span className="text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/30">
              ACTIVE CHECKPOINT
            </span>
          </div>

          <div id="reader" className="w-full overflow-hidden rounded-2xl border border-sky-500/30 bg-slate-950" />

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase">
              MANUAL ENTRY (TEAM ID / REG NO)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="e.g. ALPHA-001 or 2300030001"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-black bg-cyan-300 hover:bg-cyan-200 rounded-xl"
              >
                RECORD
              </button>
            </div>
          </form>
        </TiltCard>

        {/* Scan Results & Help Requests */}
        <div className="space-y-6">
          {scanResult && !scanResult.alreadyMarked && (
            <div className="p-6 rounded-3xl glass-card border border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in duration-200 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-emerald-300 uppercase tracking-wider">✓ PRESENT ({checkpoint.toUpperCase()})</h2>
              <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-1">
                <p>Participant: <span className="font-bold text-white">{scanResult.studentName}</span></p>
                <p>Registration No: <span className="font-mono text-cyan-300 font-bold">{scanResult.regNo}</span></p>
                <p>Team: <span className="font-mono text-white">{scanResult.teamId}</span> ({scanResult.teamName})</p>
                <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">Scanned at: {new Date(scanResult.scannedAt).toLocaleTimeString()}</p>
              </div>
            </div>
          )}

          {scanResult && scanResult.alreadyMarked && (
            <div className="p-6 rounded-3xl glass-card border border-amber-500/50 bg-amber-950/20 shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-in fade-in zoom-in duration-200 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-amber-300 uppercase tracking-wider">ALREADY SCANNED</h2>
              <p className="text-xs text-amber-200 mt-1">{scanResult.studentName} ({scanResult.regNo}) was already scanned for {checkpoint}.</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Participant Help Tickets Queue */}
          <TiltCard className="p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>PARTICIPANT ASSISTANCE TICKETS ({helpRequests.filter(h => h.status !== 'RESOLVED').length})</span>
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {helpRequests.map((h) => (
                <div key={h._id} className="p-3 rounded-xl bg-slate-950 text-xs border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{h.teamName} ({h.teamId})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">{h.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{h.message}</p>
                  </div>
                  {h.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => resolveHelp(h._id)}
                      className="px-2.5 py-1 text-[10px] font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg shrink-0"
                    >
                      RESOLVE
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0">✓ RESOLVED</span>
                  )}
                </div>
              ))}
              {helpRequests.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No pending help tickets.</p>
              )}
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
};
