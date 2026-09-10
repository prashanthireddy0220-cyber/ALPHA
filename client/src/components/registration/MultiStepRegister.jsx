import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Shield, Clock, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Users, Building2, Copy, Lock, Flame, MessageCircle, RotateCcw, Save } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { TiltCard } from '../common/TiltCard';

export const MultiStepRegister = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const draftKey = user?.email
    ? `alpha_reg_draft_${user.email.toLowerCase().trim()}`
    : 'alpha_reg_draft_guest';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [draftRestoredNotice, setDraftRestoredNotice] = useState(false);

  // Slot Reservation state (stored server-side with 5-minute timer)
  const [reservation, setReservation] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [track, setTrack] = useState('DRAGON INTELLIGENCE (AI & ML)');

  // Members Form State (Default 4 members with empty defaults)
  const defaultMember = {
    name: '',
    regNo: '',
    department: '',
    year: '',
    section: '',
    mobile: '',
    gender: '',
    accommodation: '',
    hostel: '',
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

  const clearSessionData = () => {
    sessionStorage.removeItem('alpha_reservation_id');
    sessionStorage.removeItem('alpha_registration_step');
    sessionStorage.removeItem('alpha_team_name');
    sessionStorage.removeItem('alpha_members');
    sessionStorage.removeItem('alpha_track');
    sessionStorage.removeItem('alpha_expires_at');
  };

  const handleCopy = (text, field) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClearDraft = () => {
    localStorage.removeItem(draftKey);
    setTeamName('');
    setMembers(Array.from({ length: settings.teamSize || 4 }, () => ({ ...defaultMember })));
    setTrack('DRAGON INTELLIGENCE (AI & ML)');
    setStep(1);
    setDraftRestoredNotice(false);
    setErrorMessage('');
  };

  // 1. Restore reservation timer or saved form draft on mount
  useEffect(() => {
    const savedResId = sessionStorage.getItem('alpha_reservation_id');
    const savedStep = sessionStorage.getItem('alpha_registration_step');
    const savedTeamName = sessionStorage.getItem('alpha_team_name');
    const savedMembers = sessionStorage.getItem('alpha_members');
    const savedTrack = sessionStorage.getItem('alpha_track');
    const savedExpiresAt = sessionStorage.getItem('alpha_expires_at');

    if (savedResId && (savedStep === '4' || savedStep === 4)) {
      setLoading(true);
      axios.get(`/api/registration/reservation-status/${savedResId}`)
        .then(res => {
          if (res.data.valid && !res.data.expired && res.data.remainingSeconds > 0) {
            setReservation(res.data);
            setTimerSeconds(res.data.remainingSeconds);
            if (res.data.teamName) setTeamName(res.data.teamName);
            else if (savedTeamName) setTeamName(savedTeamName);

            if (res.data.membersData && res.data.membersData.length > 0) {
              setMembers(res.data.membersData);
            } else if (savedMembers) {
              try { setMembers(JSON.parse(savedMembers)); } catch (e) {}
            }

            if (res.data.track) setTrack(res.data.track);
            else if (savedTrack) setTrack(savedTrack);

            setStep(4);
          } else {
            clearSessionData();
            setStep(1);
            setErrorMessage('Your 5-minute payment slot reservation has expired. Please start the registration process again.');
          }
        })
        .catch(() => {
          if (savedExpiresAt) {
            const exp = new Date(savedExpiresAt).getTime();
            const now = Date.now();
            const remain = Math.max(0, Math.floor((exp - now) / 1000));
            if (remain > 0) {
              setStep(4);
              setTimerSeconds(remain);
              setReservation({ reservationId: savedResId, expiresAt: savedExpiresAt, remainingSeconds: remain });
              if (savedTeamName) setTeamName(savedTeamName);
              if (savedMembers) { try { setMembers(JSON.parse(savedMembers)); } catch (e) {} }
              if (savedTrack) setTrack(savedTrack);
              return;
            }
          }
          clearSessionData();
          setStep(1);
          setErrorMessage('Your payment slot session has expired. Please start the registration process again.');
        })
        .finally(() => setLoading(false));
    } else {
      // Restore auto-saved draft for steps 1-3 from localStorage
      const savedDraftRaw = localStorage.getItem(draftKey);
      if (savedDraftRaw) {
        try {
          const savedDraft = JSON.parse(savedDraftRaw);
          if (savedDraft.teamName) setTeamName(savedDraft.teamName);
          if (savedDraft.members && Array.isArray(savedDraft.members) && savedDraft.members.length > 0) {
            setMembers(savedDraft.members);
          }
          if (savedDraft.track) setTrack(savedDraft.track);
          if (savedDraft.step && savedDraft.step >= 1 && savedDraft.step <= 3) {
            setStep(savedDraft.step);
          }
          setDraftRestoredNotice(true);
        } catch (e) {
          console.warn('Draft restoration notice:', e);
        }
      }
    }
  }, [draftKey]);

  // Auto-save form draft whenever team details change (Steps 1 to 3)
  useEffect(() => {
    if (step >= 1 && step <= 3) {
      const hasContent = teamName.trim().length > 0 || members.some(m => m.name || m.regNo || m.mobile);
      if (hasContent) {
        const draftData = {
          step,
          teamName,
          members,
          track,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
      }
    }
  }, [teamName, members, track, step, draftKey]);

  // 2. Server-side synchronized 5-minute timer countdown
  useEffect(() => {
    let interval = null;
    if (step === 4 && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            clearSessionData();
            setReservation(null);
            setErrorMessage('Your 5-minute payment slot reservation has expired. Please start the registration process again.');
            setStep(1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);
  // 3. Trigger celebratory confetti on successful registration (Step 5)
  useEffect(() => {
    if (step === 5) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn('Confetti launch error:', e);
      }
    }
  }, [step]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleTeamNameChange = (val) => {
    // Automatically store and display in BLOCK/CAPITAL LETTERS
    setTeamName(val.toUpperCase());
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    if (field === 'name' || field === 'section') {
      updated[index][field] = value.toUpperCase();
    } else if (field === 'regNo') {
      updated[index][field] = value.toUpperCase().trim();
    } else if (field === 'mobile') {
      updated[index][field] = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'gender') {
      updated[index][field] = value;
      // Reset hostel if gender changes
      updated[index]['hostel'] = '';
    } else if (field === 'accommodation') {
      updated[index][field] = value;
      if (value !== 'Hosteller') {
        updated[index]['hostel'] = '';
        updated[index]['roomNumber'] = '';
      }
    } else {
      updated[index][field] = value;
    }
    setMembers(updated);
  };

  // Step 1 -> Step 2: Validate Team Name
  const handleProceedToMembers = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!teamName.trim()) {
      setErrorMessage('Please enter a Team Name');
      return;
    }

    setStep(2);
  };

  // Step 2 -> Step 3: Validate All Participant Details with Backend Check
  const handleProceedToReview = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const formattedMembers = members.map(m => {
      const regClean = m.regNo.trim().toUpperCase();
      const derivedEmail = `${regClean.toLowerCase()}@klu.ac.in`;
      return {
        ...m,
        name: m.name.trim().toUpperCase(),
        regNo: regClean,
        section: m.section.trim().toUpperCase(),
        mobile: m.mobile.trim(),
        email: derivedEmail
      };
    });

    for (let i = 0; i < formattedMembers.length; i++) {
      const m = formattedMembers[i];
      if (!m.name || !m.regNo || !m.department || !m.year || !m.section || !m.mobile || !m.gender || !m.accommodation) {
        setErrorMessage(`Please fill out and select all required fields for Member ${i + 1}`);
        return;
      }
      if (!/^\d+$/.test(m.regNo)) {
        setErrorMessage(`Member ${i + 1} registration number must contain digits only`);
        return;
      }
      if (!/^\d{10}$/.test(m.mobile)) {
        setErrorMessage(`Member ${i + 1} mobile number must be exactly 10 digits (digits only)`);
        return;
      }
      if (!m.email.endsWith('@klu.ac.in')) {
        setErrorMessage('Please use your KLU email address (@klu.ac.in) to continue.');
        return;
      }
      if (m.accommodation === 'Hosteller' && (!m.hostel || !m.roomNumber || !m.roomNumber.trim())) {
        setErrorMessage(`Please select Hostel and specify Room Number for Member ${i + 1}`);
        return;
      }
    }

    // Check duplicate reg numbers within current team input
    const regNos = formattedMembers.map(m => m.regNo);
    const seenRegs = new Set();
    let dupRegFound = null;
    for (const r of regNos) {
      if (seenRegs.has(r)) {
        dupRegFound = r;
        break;
      }
      seenRegs.add(r);
    }
    if (dupRegFound) {
      setErrorMessage(`Duplicate Registration Number '${dupRegFound}' found inside team members list. Each member must have a unique Registration Number.`);
      return;
    }

    setLoading(true);
    try {
      // Backend Validation for Team Name & Student Email/RegNo duplicates
      await axios.post('/api/registration/validate-details', {
        teamName: teamName.trim().toUpperCase(),
        members: formattedMembers
      });

      setMembers(formattedMembers);
      setStep(3);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403 || !err.response) {
        // Fallback: If backend does not support validate-details endpoint yet (e.g., during deployment update), proceed with client validation
        console.warn('Backend validate-details returned status', err.response?.status, '- proceeding with client validation fallback.');
        setMembers(formattedMembers);
        setStep(3);
      } else {
        setErrorMessage(err.response?.data?.message || 'Validation failed. Please check your team details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> Step 4: ONLY NOW Reserve Team Slot & Start 5-Minute Timer
  const handleProceedToPayment = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      const existingResId = sessionStorage.getItem('alpha_reservation_id');
      let res;
      try {
        res = await axios.post('/api/registration/reserve-payment-slot', {
          teamName: teamName.trim().toUpperCase(),
          members,
          track,
          reservationId: existingResId
        });
      } catch (firstErr) {
        if (firstErr.response?.status === 404 || firstErr.response?.status === 403 || !firstErr.response) {
          // Fallback to legacy endpoint if reserve-payment-slot is unavailable
          res = await axios.post('/api/registration/reserve', {
            teamName: teamName.trim().toUpperCase(),
            members,
            leadRegNo: members[0]?.regNo,
            track,
            reservationId: existingResId
          });
        } else {
          throw firstErr;
        }
      }

      const resData = res.data;
      setReservation(resData);
      const remainingSecs = resData.remainingSeconds || 300;
      setTimerSeconds(remainingSecs);

      const resId = resData.reservationId || existingResId || `RES-${Date.now()}`;
      const expiresAtIso = resData.expiresAt || new Date(Date.now() + remainingSecs * 1000).toISOString();

      sessionStorage.setItem('alpha_reservation_id', resId);
      sessionStorage.setItem('alpha_registration_step', '4');
      sessionStorage.setItem('alpha_team_name', teamName.trim().toUpperCase());
      sessionStorage.setItem('alpha_members', JSON.stringify(members));
      sessionStorage.setItem('alpha_track', track);
      sessionStorage.setItem('alpha_expires_at', expiresAtIso);

      setStep(4);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403 || !err.response) {
        // Ultimate fallback: proceed with local 5-minute reservation timer if backend route is unavailable
        const expiresAtIso = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        const resId = `RES-${Date.now()}`;
        const localReservation = {
          reservationId: resId,
          expiresAt: expiresAtIso,
          remainingSeconds: 300
        };
        setReservation(localReservation);
        setTimerSeconds(300);

        sessionStorage.setItem('alpha_reservation_id', resId);
        sessionStorage.setItem('alpha_registration_step', '4');
        sessionStorage.setItem('alpha_team_name', teamName.trim().toUpperCase());
        sessionStorage.setItem('alpha_members', JSON.stringify(members));
        sessionStorage.setItem('alpha_track', track);
        sessionStorage.setItem('alpha_expires_at', expiresAtIso);

        setStep(4);
      } else {
        setErrorMessage(err.response?.data?.message || 'Slot reservation failed. Capacity may be full.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload screenshot to Cloudinary
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
      const savedResId = sessionStorage.getItem('alpha_reservation_id');
      const res = await axios.post('/api/registration/submit', {
        teamName: teamName.trim().toUpperCase(),
        track,
        members,
        utr: utr.trim(),
        screenshotUrl,
        reservationId: savedResId
      });

      clearSessionData();
      localStorage.removeItem(draftKey);
      setRegistrationResult(res.data);
      setStep(5); // Success step
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'This registration cannot be completed. Please check the entered details.');
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
            Registrations for ALPHA are currently closed by event administration.
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

      {/* Auto-Saved Progress Restored Banner */}
      {draftRestoredNotice && step <= 3 && (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-between text-xs text-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider block">UNFINISHED DRAFT AUTO-RECOVERED</span>
              <span className="text-[11px] text-slate-300">Your previously typed team details were automatically restored.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearDraft}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>
        </div>
      )}

      {/* Reservation Active Countdown Banner (ONLY SHOWN AT PAYMENT STEP 4) */}
      {reservation && step === 4 && (
        <div className="mb-8 p-4 rounded-2xl glass-card border border-amber-500/40 flex items-center justify-between shadow-[0_0_25px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">SLOT RESERVED (5 MIN TIMER)</span>
              <span className="text-[11px] text-slate-300">Complete payment & upload screenshot before timer expires</span>
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

      {/* STEP 1: Team Name */}
      {step === 1 && (
        <TiltCard className="p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>STEP 1: ENTER YOUR TEAM NAME</span>
          </h2>

          <form onSubmit={handleProceedToMembers} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                TEAM NAME (AUTO-CAPITALIZED) *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => handleTeamNameChange(e.target.value)}
                placeholder=""
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm font-bold uppercase tracking-wider"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 text-sm font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>PROCEED TO MEMBER DETAILS</span>
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
              <p className="text-xs text-slate-400">Provide details for all {members.length} team members (KLU Emails Only)</p>
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
                      FULL NAME (AUTO-CAPITALIZED) *
                    </label>
                    <input
                      type="text"
                      required
                      value={m.name}
                      onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-bold uppercase focus:outline-none focus:border-cyan-400"
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
                      placeholder=""
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold uppercase focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">DEPARTMENT *</label>
                    <select
                      value={m.department}
                      onChange={(e) => handleMemberChange(idx, 'department', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="">Select Department</option>
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
                      <option value="">Select Year</option>
                      {['II', 'III', 'IV'].map(y => (
                        <option key={y} value={y}>{y} Year</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      SECTION (AUTO-CAPITALIZED) *
                    </label>
                    <input
                      type="text"
                      required
                      value={m.section}
                      onChange={(e) => handleMemberChange(idx, 'section', e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-bold uppercase focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">MOBILE NUMBER (10 DIGITS) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={m.mobile}
                      onChange={(e) => handleMemberChange(idx, 'mobile', e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">GENDER *</label>
                    <select
                      value={m.gender}
                      onChange={(e) => handleMemberChange(idx, 'gender', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="">Select Gender</option>
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
                      <option value="">Select Accommodation</option>
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
                          disabled={!m.gender}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">{!m.gender ? 'Select Gender First' : 'Select Hostel'}</option>
                          {m.gender === 'Female' && ['LH-1', 'LH-2', 'LH-3', 'LH-4'].map(h => <option key={h} value={h}>{h}</option>)}
                          {m.gender === 'Male' && ['MH-1', 'MH-2', 'MH-3', 'MH-4', 'MH-5', 'MH-6', 'MH-7'].map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ROOM NUMBER *</label>
                        <input
                          type="text"
                          required
                          value={m.roomNumber}
                          onChange={(e) => handleMemberChange(idx, 'roomNumber', e.target.value)}
                          placeholder=""
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
                disabled={loading}
                className="w-2/3 py-3.5 text-xs font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all cursor-pointer"
              >
                {loading ? 'VALIDATING DETAILS...' : 'REVIEW REGISTRATION SUMMARY →'}
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
                <span className="font-bold text-white text-sm uppercase">{teamName}</span>
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
                      <span className="uppercase">{m.name} ({m.regNo})</span>
                      <span className="text-[10px] text-sky-400">{i === 0 ? 'LEAD' : `MEMBER ${i+1}`}</span>
                    </div>
                    <div className="text-slate-400">Dept: {m.department} | Year: {m.year} | Sec: {m.section}</div>
                    <div className="text-slate-400">Email: {m.email}</div>
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
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-2/3 py-3.5 text-xs font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] cursor-pointer"
              >
                {loading ? 'RESERVING PAYMENT SLOT...' : `CONFIRM & PROCEED TO PAYMENT (₹${totalFee}) →`}
              </button>
            </div>
          </div>
        </TiltCard>
      )}

      {/* STEP 4: Bank Account Details & UTR / Screenshot Submission (5-Min Persistent Slot Lock Active) */}
      {step === 4 && (
        <TiltCard className="p-6 md:p-8">
          {/* 5-Min Slot Lock Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-sky-950/80 border border-cyan-500/40 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center animate-pulse">
                <Clock className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>PAYMENT SLOT LOCKED (5-MIN TIMER)</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 font-mono">REFRESH PERSISTENT</span>
                </div>
                <p className="text-[11px] text-slate-300">Your slot is reserved on server. Refreshing the page continues with the exact same time.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-cyan-500/40">
              <span className="text-[10px] text-slate-400 font-bold uppercase">TIME REMAINING:</span>
              <span className="text-xl font-black font-mono text-cyan-300 tracking-wider text-glow">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>STEP 4: BANK ACCOUNT TRANSFER & PAYMENT VERIFICATION</span>
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Please transfer the total fee of <span className="text-cyan-300 font-bold text-sm">₹{totalFee}</span> ({members.length} members × ₹{settings.participantFee || 350}) to the official IEEE Student Branch Bank Account specified below before your slot expires.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Official SB Bank Account Details Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> OFFICIAL SB ACCOUNT DETAILS
                </span>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-[10px] text-cyan-300 font-bold border border-cyan-500/30">DIRECT BANK TRANSFER</span>
              </div>

              {/* Account Name */}
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Name</span>
                <span className="font-bold text-white text-sm">IEEE STUDENT BRANCH</span>
              </div>

              {/* HIGHLIGHTED Account Number */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/70 to-slate-900 border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.25)] flex items-center justify-between">
                <div>
                  <span className="text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest block">ACCOUNT NUMBER (HIGHLIGHTED)</span>
                  <span className="font-mono text-white text-lg md:text-xl font-black tracking-widest">{settings.bankAccountNumber || '335602011000121'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(settings.bankAccountNumber || '335602011000121', 'acc')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400 text-black text-xs font-black uppercase hover:bg-cyan-300 transition-all cursor-pointer flex items-center gap-1 shadow-md"
                >
                  {copiedField === 'acc' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'acc' ? 'COPIED!' : 'COPY'}</span>
                </button>
              </div>

              {/* Bank Name & Branch Name */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Name</span>
                  <span className="font-bold text-slate-200">{settings.bankName || 'UNION BANK OF INDIA'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch Name</span>
                  <span className="font-bold text-slate-200">{settings.bankBranch || 'KRISHNANKOIL, WATRAP'}</span>
                </div>
              </div>

              {/* HIGHLIGHTED IFSC Code */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/70 to-slate-900 border-2 border-sky-400/80 shadow-[0_0_25px_rgba(56,189,248,0.25)] flex items-center justify-between">
                <div>
                  <span className="text-sky-300 text-[10px] font-extrabold uppercase tracking-widest block">IFSC CODE (HIGHLIGHTED)</span>
                  <span className="font-mono text-white text-base md:text-lg font-black tracking-widest">{settings.bankIfsc || 'UBIN0562734'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(settings.bankIfsc || 'UBIN0562734', 'ifsc')}
                  className="px-3 py-1.5 rounded-lg bg-sky-400 text-black text-xs font-black uppercase hover:bg-sky-300 transition-all cursor-pointer flex items-center gap-1 shadow-md"
                >
                  {copiedField === 'ifsc' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'ifsc' ? 'COPIED!' : 'COPY'}</span>
                </button>
              </div>

              {/* MICR Code & Payable Fee */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">MICR Code</span>
                  <span className="font-mono font-bold text-slate-300">{settings.bankMicr || '626026503'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Payable Amount</span>
                  <span className="font-bold text-cyan-300 text-sm">₹{totalFee}</span>
                </div>
              </div>
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
                  placeholder=""
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-sky-500/30 text-white font-mono text-sm font-bold focus:outline-none focus:border-cyan-400"
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
                  <span className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Screenshot uploaded successfully
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !screenshotUrl || utr.length !== 12}
                className="w-full py-4 text-xs font-extrabold tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'SUBMITTING REGISTRATION...' : 'SUBMIT REGISTRATION & VERIFY'}
              </button>
            </form>
          </div>
        </TiltCard>
      )}

      {/* STEP 5: Success Confirmation & Digital Event Pass */}
      {step === 5 && registrationResult && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="p-6 rounded-3xl glass-card border border-emerald-500/40 text-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">REGISTRATION COMPLETED SUCCESSFULLY 🎉</h2>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
              Your team registration and payment details have been recorded.
            </p>
          </div>

          {/* Event Pass */}
          <TiltCard className="p-8 border border-sky-400/40 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img src="/assets/kare_logo.jpg" alt="Logo" className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="text-sm font-black text-white tracking-widest">KARE IEEE EDUCATION SOCIETY</h3>
                  <span className="text-xs font-bold text-sky-400">ALPHA OFFICIAL EVENT PASS</span>
                </div>
              </div>
              <div className="text-center md:text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">TEAM ID</span>
                <span className="text-2xl font-black text-cyan-300 font-mono text-glow">{registrationResult.teamId}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">TEAM NAME</span>
                  <span className="text-lg font-bold text-white uppercase">{registrationResult.teamName}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">TEAM LEAD</span>
                  <span className="text-sm font-bold text-cyan-300 uppercase">{registrationResult.leadName} ({registrationResult.leadEmail})</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">TEAM MEMBERS</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {members.map((m, i) => (
                      <div key={i} className="p-2 rounded bg-slate-950 text-slate-200 border border-slate-800 uppercase">
                        {i+1}. {m.name} ({m.regNo})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real Embedded QR Code for Pass Verification */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-sky-500/20">
                <div className="p-2 bg-white rounded-xl shadow-lg mb-2">
                  <QRCodeSVG value={`https://alpha-ieee-eds.vercel.app/verify/${registrationResult.teamId}`} size={120} />
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">SCAN TO VERIFY PASS</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href="https://chat.whatsapp.com/KQgGm91cXyS1WiZC8nVyls"
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
