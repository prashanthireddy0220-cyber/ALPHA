import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Clock, AlertTriangle, CheckCircle, Upload, ArrowRight, ArrowLeft, Users, QrCode, Lock, Flame, MessageCircle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { TiltCard } from '../common/TiltCard';

export const MultiStepRegister = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Slot Reservation state
  const [reservation, setReservation] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 mins

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [track, setTrack] = useState('General Innovation');

  // Members Form State (Default 4 members)
  const defaultMember = {
    name: '',
    regNo: '',
    department: 'CSE',
    year: 'III',
    section: 'A',
    mobile: '',
    gender: 'Male',
    accommodation: 'Day Scholar',
    hostel: 'MH-1',
    roomNumber: ''
  };

  const [members, setMembers] = useState(
    Array.from({ length: settings.teamSize || 4 }, () => ({ ...defaultMember }))
  );

  // Payment Form State
  const [utr, setUtr] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // Result state
  const [registrationResult, setRegistrationResult] = useState(null);

  // 10-minute timer countdown
  useEffect(() => {
    let interval = null;
    if (reservation && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setReservation(null);
      setErrorMessage('Slot reservation expired. Please restart registration.');
    }
    return () => clearInterval(interval);
  }, [reservation, timerSeconds]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  // Step 1 -> Step 2: Reserve Slot
  const handleReserveSlot = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!teamName.trim()) {
      setErrorMessage('Please enter a Team Name');
      return;
    }
    if (!members[0].regNo.trim()) {
      setErrorMessage('Please enter Team Lead Registration Number in Member 1 details');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/registration/reserve', {
        teamName,
        leadRegNo: members[0].regNo
      });
      setReservation(res.data);
      setTimerSeconds(600);
      setStep(2);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Slot reservation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Review Details
  const handleProceedToReview = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name || !m.regNo || !m.section || !m.mobile) {
        setErrorMessage(`Please fill all required fields for Member ${i + 1}`);
        return;
      }
      if (!/^\d+$/.test(m.regNo.trim())) {
        setErrorMessage(`Member ${i + 1} registration number must contain digits only`);
        return;
      }
      if (m.mobile.trim().length < 10) {
        setErrorMessage(`Member ${i + 1} mobile number must be at least 10 digits`);
        return;
      }
      if (m.accommodation === 'Hosteller' && (!m.roomNumber || !m.roomNumber.trim())) {
        setErrorMessage(`Please specify Room Number for Member ${i + 1}`);
        return;
      }
    }

    // Check duplicate reg numbers within team
    const regNos = members.map(m => m.regNo.trim().toUpperCase());
    if (new Set(regNos).size !== regNos.length) {
      setErrorMessage('Duplicate registration numbers found inside team members list.');
      return;
    }

    setStep(3);
  };

  // Upload screenshot with progress
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshotFile(file);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('screenshot', file);

    try {
      const res = await axios.post('/api/registration/upload-screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      setScreenshotUrl(res.data.url);
    } catch (err) {
      setErrorMessage('Failed to upload screenshot. Make sure file size is under 5MB.');
    }
  };

  // Step 4 -> Final Submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!utr || !/^\d{12}$/.test(utr.trim())) {
      setErrorMessage('UTR / Transaction Number MUST be EXACTLY 12 digits (numbers only).');
      return;
    }
    if (!screenshotUrl) {
      setErrorMessage('Please upload a valid payment screenshot');
      return;
    }

    setLoading(true);
    try {
      const totalAmount = members.length * (settings.participantFee || 350);
      const res = await axios.post('/api/registration/submit', {
        teamName,
        track,
        members,
        utr: utr.trim(),
        screenshotUrl,
        leadEmail: `${members[0].regNo.trim().toLowerCase()}@klu.ac.in`
      });

      setRegistrationResult(res.data);
      setStep(5); // Success step
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Registration submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const totalFee = members.length * (settings.participantFee || 350);

  if (settings && settings.registrationOpen === false) {
    return (
      <div className="max-w-xl mx-auto py-28 px-4 text-center">
        <div className="p-8 md:p-12 rounded-3xl glass-card border border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">REGISTRATION CLOSED</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Registrations for ALPHA 2026 are currently closed by event administration. 
            Please contact the organizing committee or check back later.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-28 px-4 md:px-8">
      {/* Progress Header Bar */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-3">
          <Shield className="w-4 h-4" />
          <span>ALPHA REGISTRATION PORTAL</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white">TEAM REGISTRATION</h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s
                  ? 'w-10 bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.8)]'
                  : step > s
                  ? 'w-4 bg-sky-600'
                  : 'w-4 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Reservation Active Countdown Banner */}
      {reservation && step < 5 && (
        <div className="mb-8 p-4 rounded-2xl glass-card border border-amber-500/40 flex items-center justify-between shadow-[0_0_25px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">SLOT RESERVED</span>
              <span className="text-[11px] text-slate-300">Complete payment before timer expires</span>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-400 font-mono text-glow">
            {formatTimer(timerSeconds)}
          </div>
        </div>
      )}

      {/* Global Error Alert */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Team Name & Initial Details */}
      {step === 1 && (
        <TiltCard className="p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>STEP 1: TEAM & TRACK SELECTION</span>
          </h2>

          <form onSubmit={handleReserveSlot} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                TEAM NAME *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. DRAGON CYBER FORGE"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                INNOVATION TRACK *
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 text-white focus:outline-none focus:border-cyan-400 text-sm font-semibold"
              >
                <option value="DRAGON INTELLIGENCE (AI & ML)">DRAGON INTELLIGENCE (AI & ML)</option>
                <option value="CASTLE DEFENSE (CYBERSECURITY)">CASTLE DEFENSE (CYBERSECURITY)</option>
                <option value="REALM OF CLOUD & WEB3">REALM OF CLOUD & WEB3</option>
                <option value="RUNIC HARDWARE (IOT & ROBOTICS)">RUNIC HARDWARE (IOT & ROBOTICS)</option>
                <option value="OPEN DRAGON ARENA">OPEN DRAGON ARENA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                TEAM LEAD REGISTRATION NUMBER (MEMBER 1) *
              </label>
              <input
                type="text"
                required
                value={members[0].regNo}
                onChange={(e) => handleMemberChange(0, 'regNo', e.target.value)}
                placeholder="e.g. 2300030001"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-semibold"
              />
              <p className="mt-2 text-[11px] text-sky-400">
                Generated College Email: <span className="font-mono text-white">{members[0].regNo ? `${members[0].regNo.toLowerCase()}@klu.ac.in` : 'registrationnumber@klu.ac.in'}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'RESERVING SLOT...' : 'RESERVE TEAM SLOT (10 MIN TIMER)'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </TiltCard>
      )}

      {/* STEP 2: All 4 Members Participant Details */}
      {step === 2 && (
        <div className="space-y-8">
          <div className="p-4 rounded-2xl glass-card border border-sky-400/30 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">STEP 2: PARTICIPANT DETAILS</h2>
              <p className="text-xs text-slate-400">Provide details for all {members.length} team members</p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="px-3 py-1.5 text-xs font-semibold text-sky-300 border border-sky-400/30 rounded-lg"
            >
              Back to Step 1
            </button>
          </div>

          <form onSubmit={handleProceedToReview} className="space-y-8">
            {members.map((m, idx) => (
              <TiltCard key={idx} className="p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <span className="text-xs font-black tracking-widest text-cyan-300 uppercase flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    {idx === 0 ? 'MEMBER 1 (TEAM LEAD)' : `MEMBER ${idx + 1}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      NAME AS PER SIS *
                    </label>
                    <input
                      type="text"
                      required
                      value={m.name}
                      onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      REGISTRATION NUMBER *
                    </label>
                    <input
                      type="text"
                      required
                      value={m.regNo}
                      onChange={(e) => handleMemberChange(idx, 'regNo', e.target.value)}
                      placeholder="e.g. 2300030001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                    />
                    <span className="block mt-1 text-[10px] text-sky-400">
                      College Email: {m.regNo ? `${m.regNo.toLowerCase()}@klu.ac.in` : '@klu.ac.in'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">DEPARTMENT *</label>
                    <select
                      value={m.department}
                      onChange={(e) => handleMemberChange(idx, 'department', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                    >
                      {['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL', 'BIO', 'OTHERS'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">YEAR *</label>
                    <select
                      value={m.year}
                      onChange={(e) => handleMemberChange(idx, 'year', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                    >
                      {['II', 'III', 'IV'].map(y => (
                        <option key={y} value={y}>{y} Year</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">SECTION *</label>
                    <input
                      type="text"
                      required
                      value={m.section}
                      onChange={(e) => handleMemberChange(idx, 'section', e.target.value)}
                      placeholder="e.g. S15 or Section A"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">MOBILE NUMBER *</label>
                    <input
                      type="tel"
                      required
                      value={m.mobile}
                      onChange={(e) => handleMemberChange(idx, 'mobile', e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">GENDER *</label>
                    <select
                      value={m.gender}
                      onChange={(e) => handleMemberChange(idx, 'gender', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ACCOMMODATION *</label>
                    <select
                      value={m.accommodation}
                      onChange={(e) => handleMemberChange(idx, 'accommodation', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="Day Scholar">Day Scholar</option>
                      <option value="Hosteller">Hosteller</option>
                    </select>
                  </div>

                  {m.accommodation === 'Hosteller' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">HOSTEL *</label>
                        <select
                          value={m.hostel}
                          onChange={(e) => handleMemberChange(idx, 'hostel', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                        >
                          {m.gender === 'Female'
                            ? ['LH-1', 'LH-2', 'LH-3', 'LH-4'].map(h => <option key={h} value={h}>{h}</option>)
                            : ['MH-1', 'MH-2', 'MH-3', 'MH-4', 'MH-5', 'MH-6', 'MH-7'].map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ROOM NUMBER *</label>
                        <input
                          type="text"
                          required
                          value={m.roomNumber}
                          onChange={(e) => handleMemberChange(idx, 'roomNumber', e.target.value)}
                          placeholder="e.g. 402-B"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </TiltCard>
            ))}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 text-xs font-bold text-slate-300 glass-card rounded-xl"
              >
                EDIT STEP 1
              </button>
              <button
                type="submit"
                className="w-2/3 py-3.5 text-xs font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all"
              >
                REVIEW DETAILS & PROCEED TO PAYMENT →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Review Registration Summary */}
      {step === 3 && (
        <TiltCard className="p-8">
          <h2 className="text-xl font-bold text-white mb-6">STEP 3: REGISTRATION SUMMARY REVIEW</h2>

          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block uppercase">Team Name</span>
                <span className="font-bold text-white text-sm">{teamName}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase">Track</span>
                <span className="font-bold text-cyan-300">{track}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase">Team Size</span>
                <span className="font-bold text-white">{members.length} Members</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase">Total Fee</span>
                <span className="font-bold text-cyan-300 text-sm">₹{totalFee}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member Roster</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((m, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-white flex justify-between">
                      <span>{m.name} ({m.regNo})</span>
                      <span className="text-[10px] text-sky-400">{i === 0 ? 'LEAD' : `MEMBER ${i+1}`}</span>
                    </div>
                    <div className="text-slate-400">Dept: {m.department} | Year: {m.year} | Sec: {m.section}</div>
                    <div className="text-slate-400">Mobile: {m.mobile} | {m.accommodation} {m.accommodation === 'Hosteller' ? `(${m.hostel} / ${m.roomNumber})` : ''}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 text-xs font-bold text-slate-300 glass-card rounded-xl"
              >
                EDIT DETAILS
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-2/3 py-3.5 text-xs font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]"
              >
                CONFIRM & PAY ₹{totalFee} →
              </button>
            </div>
          </div>
        </TiltCard>
      )}

      {/* STEP 4: Payment UPI QR & UTR / Screenshot Submission */}
      {step === 4 && (
        <TiltCard className="p-8">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <span>STEP 4: PAYMENT VERIFICATION</span>
          </h2>
          <p className="text-xs text-slate-400 mb-6">Scan QR or use UPI ID to pay exact total amount</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* UPI QR & Info */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-sky-500/30 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-white rounded-2xl shadow-xl mb-4">
                <QRCodeSVG value={`upi://pay?pa=${settings.upiId || 'kareieee@upi'}&pn=KARE%20IEEE&am=${totalFee}&cu=INR`} size={180} />
              </div>
              <div className="text-xs font-bold text-white mb-1">UPI ID: <span className="text-cyan-300 font-mono">{settings.upiId || 'kareieee@upi'}</span></div>
              <div className="text-sm font-black text-cyan-300 mt-2 text-glow">TOTAL AMOUNT: ₹{totalFee}</div>
              <span className="text-[10px] text-slate-400 mt-1">({members.length} members × ₹{settings.participantFee || 350})</span>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                  UTR / TRANSACTION NUMBER (EXACTLY 12 DIGITS) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 408212345678"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-sky-500/30 text-white font-mono text-sm font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Digits entered: {utr.length}/12</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                  PAYMENT SCREENSHOT *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30"
                />

                {uploadProgress > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-300 mb-1 font-semibold">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {screenshotUrl && (
                  <span className="text-[11px] text-emerald-400 font-semibold mt-2 block flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Screenshot uploaded successfully
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !screenshotUrl || utr.length !== 12}
                className="w-full py-4 text-xs font-extrabold tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all disabled:opacity-50"
              >
                {loading ? 'SUBMITTING REGISTRATION...' : 'SUBMIT REGISTRATION & VERIFY'}
              </button>
            </form>
          </div>
        </TiltCard>
      )}

      {/* STEP 5: Success Page & Digital Event Pass */}
      {step === 5 && registrationResult && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="p-6 rounded-3xl glass-card border border-emerald-500/40 text-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">REGISTRATION SUBMITTED 🎉</h2>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
              Your team registration and payment verification request have been successfully recorded.
            </p>
          </div>

          {/* Event Pass */}
          <TiltCard className="p-8 border border-sky-400/40 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img src="/assets/kare_logo.jpg" alt="Logo" className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="text-sm font-black text-white tracking-widest">KARE IEEE EDUCATION SOCIETY</h3>
                  <span className="text-xs font-bold text-sky-400">ALPHA 2026 OFFICIAL EVENT PASS</span>
                </div>
              </div>
              <div className="text-center md:text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ASSIGNED TEAM ID</span>
                <span className="text-2xl font-black text-cyan-300 font-mono text-glow">{registrationResult.teamId}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">TEAM NAME</span>
                  <span className="text-lg font-bold text-white">{registrationResult.teamName}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">TEAM MEMBERS</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {members.map((m, i) => (
                      <div key={i} className="p-2 rounded bg-slate-950 text-slate-200 border border-slate-800">
                        {i+1}. {m.name} ({m.regNo})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Embedded QR Code for Volunteer Scanner */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-sky-500/20">
                <div className="p-2 bg-white rounded-xl shadow-lg mb-2">
                  <QRCodeSVG value={`https://alpha-hackathon.klu.ac.in/verify/${registrationResult.teamId}`} size={120} />
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">SCAN FOR ATTENDANCE</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href="https://chat.whatsapp.com/BST4xC9Kdkc3ccZ30BLWYo"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center flex items-center justify-center gap-2 hover:bg-emerald-900/60 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>JOIN OFFICIAL WHATSAPP GROUP</span>
              </a>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-black bg-cyan-300 hover:bg-cyan-200 rounded-xl shadow-lg"
              >
                DOWNLOAD / PRINT EVENT PASS
              </button>
            </div>
          </TiltCard>

          {/* Prominent Post-Registration WhatsApp Group Banner */}
          <div className="p-6 rounded-3xl glass-card border border-emerald-500/50 bg-emerald-950/30 text-center shadow-[0_0_35px_rgba(16,185,129,0.25)] space-y-3">
            <h3 className="text-base font-black text-white">OFFICIAL PARTICIPANT WHATSAPP GROUP</h3>
            <p className="text-xs text-emerald-200 font-light max-w-md mx-auto">
              Registration successful! Please join the official WhatsApp group for live announcements and team updates:
            </p>
            <a
              href="https://chat.whatsapp.com/BST4xC9Kdkc3ccZ30BLWYo"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 text-xs font-black tracking-wider text-black bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 hover:from-teal-300 hover:to-emerald-400 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 text-black" />
              <span>CLICK TO JOIN WHATSAPP GROUP</span>
            </a>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 text-xs font-bold text-sky-300 glass-button rounded-xl"
            >
              GO TO PARTICIPANT DASHBOARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
