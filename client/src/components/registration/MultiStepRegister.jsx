import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  Building2,
  Copy,
  Lock,
  Flame,
  MessageCircle,
  RotateCcw,
  Save,
  Check,
  User,
  Mail,
  Edit3,
  Sparkles
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { TiltCard } from '../common/TiltCard';
import { OfficialEventPass } from '../common/OfficialEventPass';

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

  // Steps:
  // 1: Team Info
  // 2: Member 1 (Lead Details)
  // 3: Teammate 2 Details
  // 4: Teammate 3 Details
  // 5: Teammate 4 Details
  // 6: Verify Details
  // 7: Payment (5-Minute Lock)
  // 8: Complete / Event Pass
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [draftRestoredNotice, setDraftRestoredNotice] = useState(false);

  // Existing Team Check for this user account
  const [existingUserTeam, setExistingUserTeam] = useState(null);
  const [checkingExistingTeam, setCheckingExistingTeam] = useState(true);

  // Slot Reservation state (stored server-side with 5-minute timer)
  const [reservation, setReservation] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [track, setTrack] = useState('DRAGON INTELLIGENCE (AI & ML)');
  const [teamNameStatus, setTeamNameStatus] = useState({ checking: false, available: null, message: '' });
  const checkTimerRef = React.useRef(null);

  // Members Form State
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
    roomNumber: '',
    email: ''
  };

  const [members, setMembers] = useState(() => {
    const leadInit = {
      ...defaultMember,
      name: user?.name && user.name !== 'ALPHA Student' ? user.name : '',
      regNo: user?.email ? user.email.split('@')[0].toUpperCase() : '',
      email: user?.email || ''
    };
    return Array.from({ length: settings.teamSize || 4 }, (_, idx) =>
      idx === 0 ? leadInit : { ...defaultMember }
    );
  });

  // Payment Form State
  const [utr, setUtr] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

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
    const leadInit = {
      ...defaultMember,
      name: user?.name && user.name !== 'ALPHA Student' ? user.name : '',
      regNo: user?.email ? user.email.split('@')[0].toUpperCase() : '',
      email: user?.email || ''
    };
    setMembers(
      Array.from({ length: settings.teamSize || 4 }, (_, idx) =>
        idx === 0 ? leadInit : { ...defaultMember }
      )
    );
    setTrack('DRAGON INTELLIGENCE (AI & ML)');
    setStep(1);
    setDraftRestoredNotice(false);
    setErrorMessage('');
    setTeamNameStatus({ checking: false, available: null, message: '' });
  };

  // 1. Check if the current user already registered a team & reset form state on account switch
  useEffect(() => {
    let isMounted = true;
    if (!user?.email) return;

    setCheckingExistingTeam(true);
    setExistingUserTeam(null);
    setRegistrationResult(null);

    // Reset registration form state whenever active user changes
    setStep(1);
    setTeamName('');
    setErrorMessage('');
    setReservation(null);
    setDraftRestoredNotice(false);

    const leadInit = {
      ...defaultMember,
      name: user?.name && user.name !== 'ALPHA Student' ? user.name : '',
      regNo: user?.email ? user.email.split('@')[0].toUpperCase() : '',
      email: user?.email || ''
    };
    setMembers(Array.from({ length: settings.teamSize || 4 }, (_, idx) =>
      idx === 0 ? leadInit : { ...defaultMember }
    ));

    axios.get('/api/registration/my-team')
      .then(res => {
        if (isMounted) {
          if (res.data && res.data.team) {
            setExistingUserTeam(res.data.team);
          } else {
            setExistingUserTeam(null);
          }
        }
      })
      .catch((err) => {
        // If 404 / team deleted by admin, ensure clean state so user can register fresh from scratch
        if (isMounted) {
          setExistingUserTeam(null);
          clearSessionData();
          localStorage.removeItem(draftKey);
          if (user?.email) {
            sessionStorage.removeItem(`alpha_cached_team_dashboard_${user.email.toLowerCase()}`);
          }
          if (user?.teamId) {
            const cleanUser = { ...user };
            delete cleanUser.teamId;
            setUser(cleanUser);
            sessionStorage.setItem('alpha_user', JSON.stringify(cleanUser));
          }
        }
      })
      .finally(() => {
        if (isMounted) setCheckingExistingTeam(false);
      });
    return () => { isMounted = false; };
  }, [user?.email]);

  // 2. Restore reservation timer or saved form draft on mount
  useEffect(() => {
    const savedResId = sessionStorage.getItem('alpha_reservation_id');
    const savedStep = sessionStorage.getItem('alpha_registration_step');
    const savedTeamName = sessionStorage.getItem('alpha_team_name');
    const savedMembers = sessionStorage.getItem('alpha_members');
    const savedTrack = sessionStorage.getItem('alpha_track');
    const savedExpiresAt = sessionStorage.getItem('alpha_expires_at');

    if (savedResId && (savedStep === '7' || savedStep === 7 || savedStep === '4' || savedStep === 4)) {
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

            setStep(7);
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
              setStep(7);
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
      // Restore auto-saved draft for steps 1-6 from localStorage strictly for current authenticated user
      if (user?.email) {
        const savedDraftRaw = localStorage.getItem(draftKey);
        if (savedDraftRaw) {
          try {
            const savedDraft = JSON.parse(savedDraftRaw);
            if (savedDraft.teamName) setTeamName(savedDraft.teamName);
            if (savedDraft.members && Array.isArray(savedDraft.members) && savedDraft.members.length > 0) {
              const merged = savedDraft.members.map((m, idx) => ({
                ...defaultMember,
                ...m,
                email: idx === 0 ? user.email : (m.email || '')
              }));
              setMembers(merged);
            }
            if (savedDraft.track) setTrack(savedDraft.track);
            if (savedDraft.step && savedDraft.step >= 1 && savedDraft.step <= 6) {
              setStep(savedDraft.step);
            }
            setDraftRestoredNotice(true);
          } catch (e) {
            console.warn('Draft restoration notice:', e);
          }
        }
      }
    }
  }, [draftKey]);

  // Auto-save form draft whenever team details change (Steps 1 to 6)
  useEffect(() => {
    if (step >= 1 && step <= 6) {
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

  // 3. Server-side synchronized 5-minute timer countdown (Step 7)
  useEffect(() => {
    let interval = null;
    if (step === 7 && timerSeconds > 0) {
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

  // 4. Trigger celebratory confetti on successful registration (Step 8)
  useEffect(() => {
    if (step === 8) {
      try {
        confetti({
          particleCount: 150,
          spread: 85,
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

  // Team Name Validation Rule Checkers:
  // 1) No two or more consecutive spaces
  // 2) First word cannot be 'Team'
  const validateTeamNameRules = (val) => {
    if (/\s{2,}/.test(val)) {
      return 'Team name cannot contain two or more consecutive spaces.';
    }
    const trimmed = val.trim();
    if (/^team(\s|$)/i.test(trimmed)) {
      return "Team name cannot start with the word 'Team'.";
    }
    return '';
  };

  const handleTeamNameChange = (val) => {
    const upper = val.toUpperCase();
    setTeamName(upper);

    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
    }

    const ruleErr = validateTeamNameRules(upper);
    if (ruleErr) {
      setTeamNameStatus({ checking: false, available: false, message: ruleErr });
      return;
    }

    if (!upper.trim()) {
      setTeamNameStatus({ checking: false, available: null, message: '' });
      return;
    }

    setTeamNameStatus({ checking: true, available: null, message: 'Checking availability...' });
    checkTimerRef.current = setTimeout(() => {
      const queryName = encodeURIComponent(upper.trim());
      axios.get(`/api/registration/check-team-name?name=${queryName}`)
        .then(res => {
          if (res.data && res.data.valid === false) {
            setTeamNameStatus({
              checking: false,
              available: false,
              message: res.data.message || 'This team name is already taken'
            });
          } else {
            setTeamNameStatus({ checking: false, available: true, message: 'Team name is available!' });
          }
        })
        .catch(err => {
          if (err.response?.status === 400 && err.response?.data?.message) {
            setTeamNameStatus({
              checking: false,
              available: false,
              message: err.response.data.message
            });
          } else {
            // Fallback for non-400 or network issue: do not mark unavailable
            setTeamNameStatus({ checking: false, available: null, message: '' });
          }
        });
    }, 350);
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    if (field === 'name' || field === 'section') {
      updated[index][field] = value.toUpperCase();
    } else if (field === 'regNo') {
      const cleanReg = value.replace(/\D/g, '').toUpperCase();
      updated[index][field] = cleanReg;
      // Auto-suggest KLU email if email is currently empty
      if (cleanReg && !updated[index]['email']) {
        updated[index]['email'] = `${cleanReg.toLowerCase()}@klu.ac.in`;
      }
    } else if (field === 'mobile') {
      updated[index][field] = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'gender') {
      updated[index][field] = value;
      updated[index]['hostel'] = '';
    } else if (field === 'accommodation') {
      updated[index][field] = value;
      if (value !== 'Hosteller') {
        updated[index]['hostel'] = '';
        updated[index]['roomNumber'] = '';
      }
    } else if (field === 'email') {
      updated[index][field] = value.trim().toLowerCase();
    } else {
      updated[index][field] = value;
    }
    setMembers(updated);
  };

  // STEP 1 -> STEP 2: Validate Team Info
  const handleProceedFromTeamInfo = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = teamName.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a Team Name.');
      return;
    }

    const ruleErr = validateTeamNameRules(teamName);
    if (ruleErr) {
      setErrorMessage(ruleErr);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/registration/check-team-name?name=${encodeURIComponent(trimmed)}`);
      if (res.data && res.data.valid === false) {
        setErrorMessage(res.data.message || 'This team name is already taken. Please choose another.');
        setLoading(false);
        return;
      }
      setStep(2);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
        setLoading(false);
        return;
      }
      // If endpoint is unavailable or network error, proceed without blocking
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Generic validator for an individual member step
  const validateSingleMember = (index) => {
    const m = members[index];
    const roleLabel = index === 0 ? 'Member 1 (Team Lead)' : `Teammate ${index + 1}`;

    if (!m.name || !m.name.trim()) {
      return `${roleLabel}: Full Name is required.`;
    }
    if (!m.regNo || !m.regNo.trim()) {
      return `${roleLabel}: Registration Number is required.`;
    }
    if (!/^\d+$/.test(m.regNo.trim())) {
      return `${roleLabel}: Registration Number must contain digits only.`;
    }

    // Check duplicate with previous members
    for (let i = 0; i < index; i++) {
      if (members[i].regNo && members[i].regNo.trim().toUpperCase() === m.regNo.trim().toUpperCase()) {
        return `Registration Number '${m.regNo}' is already entered for ${i === 0 ? 'Member 1 (Team Lead)' : `Teammate ${i + 1}`}. Duplicate registration numbers are strictly forbidden.`;
      }
      if (m.email && members[i].email && members[i].email.trim().toLowerCase() === m.email.trim().toLowerCase()) {
        return `Email '${m.email}' is already entered for ${i === 0 ? 'Member 1 (Team Lead)' : `Teammate ${i + 1}`}. Duplicate emails are strictly forbidden.`;
      }
    }

    if (!m.department) return `${roleLabel}: Please select Department.`;
    if (!m.year) return `${roleLabel}: Please select Year.`;
    if (!m.section || !m.section.trim()) return `${roleLabel}: Section is required.`;
    if (!m.mobile || !/^\d{10}$/.test(m.mobile.trim())) return `${roleLabel}: Mobile number must be exactly 10 digits.`;
    if (!m.gender) return `${roleLabel}: Please select Gender.`;
    if (!m.accommodation) return `${roleLabel}: Please select Accommodation.`;
    if (m.accommodation === 'Hosteller' && (!m.hostel || !m.roomNumber || !m.roomNumber.trim())) {
      return `${roleLabel}: Please specify both Hostel and Room Number.`;
    }

    // Auto-compute email from Registration Number
    m.email = `${m.regNo.trim().toLowerCase()}@klu.ac.in`;

    return '';
  };

  const handleNextMemberStep = (currentIndex, e) => {
    e.preventDefault();
    setErrorMessage('');

    const error = validateSingleMember(currentIndex);
    if (error) {
      setErrorMessage(error);
      return;
    }

    // Advance to next member step or to Verify (Step 6)
    if (currentIndex < (settings.teamSize || 4) - 1) {
      setStep(currentIndex + 2 + 1); // e.g. currentIndex=0 -> step 3 (Teammate 2)
    } else {
      setStep(6); // Step 6: Verify
    }
  };

  // STEP 6 -> STEP 7: Validate Entire Team with Backend & Reserve Slot
  const handleProceedToPayment = async () => {
    setErrorMessage('');
    setLoading(true);

    // Re-verify all members
    for (let i = 0; i < members.length; i++) {
      const err = validateSingleMember(i);
      if (err) {
        setErrorMessage(err);
        setLoading(false);
        setStep(i + 2); // Go directly to the step that has error
        return;
      }
    }

    // Ensure at least one team member uses the logged-in account email
    const loginEmail = (user?.email || '').trim().toLowerCase();
    if (loginEmail) {
      const hasLoginEmail = members.some(
        m => (m.email || '').trim().toLowerCase() === loginEmail
      );
      if (!hasLoginEmail) {
        setErrorMessage(`At least one team member must use your logged-in account email (${user.email}).`);
        setLoading(false);
        return;
      }
    }

    const formattedMembers = members.map(m => ({
      ...m,
      name: m.name.trim().toUpperCase(),
      regNo: m.regNo.trim().toUpperCase(),
      section: m.section.trim().toUpperCase(),
      mobile: m.mobile.trim(),
      email: m.email.trim().toLowerCase()
    }));

    try {
      // 1. Pre-flight check with backend validate-details
      await axios.post('/api/registration/validate-details', {
        teamName: teamName.trim().toUpperCase(),
        members: formattedMembers
      });

      // 2. Reserve 5-minute payment slot
      const existingResId = sessionStorage.getItem('alpha_reservation_id');
      const res = await axios.post('/api/registration/reserve-payment-slot', {
        teamName: teamName.trim().toUpperCase(),
        members: formattedMembers,
        track,
        reservationId: existingResId
      });

      const resData = res.data;
      setReservation(resData);
      const remainingSecs = resData.remainingSeconds || 300;
      setTimerSeconds(remainingSecs);

      const resId = resData.reservationId || existingResId || `RES-${Date.now()}`;
      const expiresAtIso = resData.expiresAt || new Date(Date.now() + remainingSecs * 1000).toISOString();

      sessionStorage.setItem('alpha_reservation_id', resId);
      sessionStorage.setItem('alpha_registration_step', '7');
      sessionStorage.setItem('alpha_team_name', teamName.trim().toUpperCase());
      sessionStorage.setItem('alpha_members', JSON.stringify(formattedMembers));
      sessionStorage.setItem('alpha_track', track);
      sessionStorage.setItem('alpha_expires_at', expiresAtIso);

      setMembers(formattedMembers);
      setStep(7); // Proceed to Payment
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Verification failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  // Upload screenshot
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshotFile(file);
    setUploadProgress(0);

    // 1. Convert to Base64 Data URL for instant local preview and guaranteed permanent storage
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      setPreviewUrl(base64Data);
      setScreenshotUrl(base64Data);

      // 2. Also send to server
      const formData = new FormData();
      formData.append('screenshot', file);
      formData.append('base64', base64Data);

      try {
        const res = await axios.post('/api/registration/upload-screenshot', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        });
        if (res.data?.url) {
          setScreenshotUrl(res.data.url);
        }
      } catch (err) {
        console.warn('Server upload fallback to direct base64 data:', err);
      }
    };
    reader.readAsDataURL(file);
  };


  // STEP 7 -> STEP 8: Final Submission
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!utr || !/^\d{12}$/.test(utr.trim())) {
      setErrorMessage('UTR / Transaction Number MUST be EXACTLY 12 digits (numbers only).');
      return;
    }
    if (!screenshotUrl) {
      setErrorMessage('Please upload your payment screenshot.');
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
      setStep(8); // Success step
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'This registration could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const totalFee = (members.length || 4) * (settings.participantFee || 350);

  // If registrations are closed
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

  // If user has already registered a team
  if (existingUserTeam && !checkingExistingTeam) {
    return (
      <div className="max-w-xl mx-auto py-28 px-4 text-center">
        <TiltCard className="p-8 md:p-10 rounded-3xl glass-card border border-sky-500/40 bg-slate-950/90 shadow-[0_0_50px_rgba(0,240,255,0.25)]">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-cyan-300" />
          </div>
          <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest block mb-2">
            SINGLE REGISTRATION ENFORCED
          </span>
          <h2 className="text-2xl font-black text-white uppercase mb-2">
            TEAM ALREADY REGISTERED
          </h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Your account (<strong className="text-cyan-300 font-mono">{user.email}</strong>) has already registered team <strong className="text-white uppercase">{existingUserTeam.teamName}</strong> (Pass ID: <strong className="text-cyan-400 font-mono">{existingUserTeam.teamId}</strong>).
            <br />
            <span className="text-slate-400 text-[11px] mt-2 block">
              Each student account is strictly allowed to register only one team.
            </span>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 text-xs font-black tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all cursor-pointer uppercase"
            >
              GO TO PARTICIPANT DASHBOARD
            </button>
            <button
              type="button"
              onClick={async () => {
                clearSessionData();
                localStorage.removeItem(draftKey);
                sessionStorage.removeItem('alpha_cached_team_dashboard');
                setExistingUserTeam(null);
                setCheckingExistingTeam(true);
                try {
                  const res = await axios.get('/api/registration/my-team');
                  if (res.data?.team) {
                    setExistingUserTeam(res.data.team);
                  } else {
                    setExistingUserTeam(null);
                    setStep(1);
                  }
                } catch (e) {
                  setExistingUserTeam(null);
                  setStep(1);
                } finally {
                  setCheckingExistingTeam(false);
                }
              }}
              className="w-full py-3 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-2xl cursor-pointer transition-all"
            >
              🔄 Check Live Status / Register Fresh Team
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-xs font-bold text-slate-300 glass-button rounded-2xl cursor-pointer"
            >
              Back to Homepage
            </button>
          </div>
        </TiltCard>
      </div>
    );
  }

  // Step Title mapping
  const stepTitles = [
    { num: 1, label: 'Team Info' },
    { num: 2, label: 'Lead (Member 1)' },
    { num: 3, label: 'Teammate 2' },
    { num: 4, label: 'Teammate 3' },
    { num: 5, label: 'Teammate 4' },
    { num: 6, label: 'Verify' },
    { num: 7, label: 'Payment' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-28 px-4 md:px-8">
      {/* Progress Header Bar */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-3">
          <Shield className="w-4 h-4" />
          <span>ALPHA REGISTRATION PORTAL</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
          TEAM REGISTRATION
        </h1>

        {/* Step Indicator (Steps 1 to 7) */}
        {step <= 7 && (
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-1">
              {stepTitles.map((s) => (
                <div key={s.num} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full h-2 rounded-full transition-all duration-300 ${
                      step === s.num
                        ? 'bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.8)]'
                        : step > s.num
                        ? 'bg-sky-600'
                        : 'bg-slate-800'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold mt-2 uppercase tracking-wider hidden sm:block ${
                      step === s.num
                        ? 'text-cyan-300 font-extrabold'
                        : step > s.num
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auto-Saved Progress Restored Banner */}
      {draftRestoredNotice && step <= 6 && (
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

      {/* Reservation Active Countdown Banner (ONLY SHOWN AT PAYMENT STEP 7) */}
      {reservation && step === 7 && (
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

      {/* ========================================================================= */}
      {/* STEP 1: Team Info */}
      {/* ========================================================================= */}
      {step === 1 && (
        <TiltCard className="p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>STEP 1: TEAM INFORMATION</span>
            </h2>
            <span className="text-xs font-bold text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30">
              STEP 1 OF 7
            </span>
          </div>

          {/* Registering Account Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 shadow-[0_0_20px_rgba(0,240,255,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-sky-300" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider block">
                  LOGGED-IN ACCOUNT EMAIL
                </span>
                <span className="text-sm font-black font-mono text-white">
                  {user?.email}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-semibold">
              📌 Note: At least one member must match your login registration number.
            </div>
          </div>

          <form onSubmit={handleProceedFromTeamInfo} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                TEAM NAME (AUTO-CAPITALIZED) *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => handleTeamNameChange(e.target.value)}
                placeholder="e.g. CYBER DRAGONS, NEURAL NEXUS"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm font-bold uppercase tracking-wider font-mono"
              />

              {/* Real-time validation indicators */}
              <div className="mt-2 text-xs">
                {teamNameStatus.checking && (
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    Checking availability...
                  </span>
                )}
                {!teamNameStatus.checking && teamNameStatus.available === true && (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {teamNameStatus.message}
                  </span>
                )}
                {!teamNameStatus.checking && teamNameStatus.available === false && (
                  <span className="text-red-400 flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    {teamNameStatus.message}
                  </span>
                )}
              </div>

              {/* Rule notices */}
              <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Team Name Rules:</div>
                <div>• Cannot be already taken by another team.</div>
                <div>• Two or more consecutive spaces (<code className="text-cyan-300">"  "</code>) are not allowed.</div>
                <div>• First word cannot begin with <strong className="text-amber-300">"Team"</strong> (e.g. use <em className="text-slate-200">"CYBER DRAGONS"</em> instead of <em className="text-slate-400">"Team Cyber Dragons"</em>).</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || teamNameStatus.available === false}
              className="w-full py-4 text-sm font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'VALIDATING TEAM NAME...' : 'PROCEED TO MEMBER 1 (LEAD DETAILS)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </TiltCard>
      )}

      {/* ========================================================================= */}
      {/* STEP 2 to STEP 5: Individual Member Form Steps */}
      {/* Step 2 = Lead (index 0) */}
      {/* Step 3 = Teammate 2 (index 1) */}
      {/* Step 4 = Teammate 3 (index 2) */}
      {/* Step 5 = Teammate 4 (index 3) */}
      {/* ========================================================================= */}
      {step >= 2 && step <= 5 && (() => {
        const memberIndex = step - 2; // 0, 1, 2, or 3
        const isLead = memberIndex === 0;
        const currentMember = members[memberIndex] || defaultMember;
        const memberTitle = isLead ? 'MEMBER 1 (TEAM LEAD DETAILS)' : `TEAMMATE ${memberIndex + 1} DETAILS`;
        const nextButtonText = memberIndex === (settings.teamSize || 4) - 1
          ? 'PROCEED TO VERIFY DETAILS →'
          : `PROCEED TO TEAMMATE ${memberIndex + 2} →`;

        return (
          <TiltCard className="p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                  TEAM: {teamName}
                </span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                  <User className="w-5 h-5 text-cyan-400" />
                  <span>STEP {step}: {memberTitle}</span>
                </h2>
              </div>
              <span className="text-xs font-bold text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30">
                STEP {step} OF 7
              </span>
            </div>

            <form onSubmit={(e) => handleNextMemberStep(memberIndex, e)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    FULL NAME (AUTO-CAPITALIZED) *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentMember.name}
                    onChange={(e) => handleMemberChange(memberIndex, 'name', e.target.value)}
                    placeholder="e.g. JOHN DOE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-bold uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Registration Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    REGISTRATION NUMBER (DIGITS ONLY) *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentMember.regNo}
                    onChange={(e) => handleMemberChange(memberIndex, 'regNo', e.target.value)}
                    placeholder="e.g. 99240040799"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-bold uppercase focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Must be unique within the team and across all participating teams.
                  </span>
                </div>

                {/* Student Email: Auto-generated from Registration Number (Cannot be edited) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 flex items-center justify-between">
                    <span>STUDENT EMAIL (AUTO-GENERATED)</span>
                    {currentMember.regNo && `${currentMember.regNo.toLowerCase()}@klu.ac.in` === (user?.email || '').toLowerCase() && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> LOGIN ACCOUNT EMAIL
                      </span>
                    )}
                  </label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-300 text-xs font-mono flex items-center justify-between select-none">
                    <span>
                      {currentMember.regNo
                        ? `${currentMember.regNo.toLowerCase()}@klu.ac.in`
                        : 'Enter Registration Number above'}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-sans font-bold">LOCKED</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Automatically assigned as <span className="font-mono text-cyan-300">[Reg_No]@klu.ac.in</span>
                  </span>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    DEPARTMENT *
                  </label>
                  <select
                    value={currentMember.department}
                    required
                    onChange={(e) => handleMemberChange(memberIndex, 'department', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="">Select Department</option>
                    {['CSE', 'ECE', 'IT', 'AI&DS', 'EEE', 'MECH', 'CIVIL', 'BIO', 'OTHERS'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    YEAR *
                  </label>
                  <select
                    value={currentMember.year}
                    required
                    onChange={(e) => handleMemberChange(memberIndex, 'year', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="">Select Year</option>
                    {['I', 'II', 'III', 'IV'].map(y => (
                      <option key={y} value={y}>{y} Year</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    SECTION (AUTO-CAPITALIZED) *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentMember.section}
                    onChange={(e) => handleMemberChange(memberIndex, 'section', e.target.value)}
                    placeholder="e.g. 24S08"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-bold uppercase focus:outline-none"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    MOBILE NUMBER (10 DIGITS) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={currentMember.mobile}
                    onChange={(e) => handleMemberChange(memberIndex, 'mobile', e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none font-mono"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    GENDER *
                  </label>
                  <select
                    value={currentMember.gender}
                    required
                    onChange={(e) => handleMemberChange(memberIndex, 'gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Accommodation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    ACCOMMODATION *
                  </label>
                  <select
                    value={currentMember.accommodation}
                    required
                    onChange={(e) => handleMemberChange(memberIndex, 'accommodation', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="">Select Accommodation</option>
                    <option value="Day Scholar">Day Scholar</option>
                    <option value="Hosteller">Hosteller</option>
                  </select>
                </div>

                {/* Hosteller Fields */}
                {currentMember.accommodation === 'Hosteller' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">HOSTEL *</label>
                      <select
                        value={currentMember.hostel}
                        required
                        onChange={(e) => handleMemberChange(memberIndex, 'hostel', e.target.value)}
                        disabled={!currentMember.gender}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none disabled:opacity-50"
                      >
                        <option value="">{!currentMember.gender ? 'Select Gender First' : 'Select Hostel'}</option>
                        {currentMember.gender === 'Female' && ['LH-1', 'LH-2', 'LH-3', 'LH-4'].map(h => <option key={h} value={h}>{h}</option>)}
                        {currentMember.gender === 'Male' && ['MH-1', 'MH-2', 'MH-3', 'MH-4', 'MH-5', 'MH-6', 'MH-7'].map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ROOM NUMBER *</label>
                      <input
                        type="text"
                        required
                        value={currentMember.roomNumber}
                        onChange={(e) => handleMemberChange(memberIndex, 'roomNumber', e.target.value)}
                        placeholder="e.g. 302"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/20 text-white text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="w-1/3 py-3.5 text-xs font-bold text-slate-300 glass-card rounded-xl hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 text-xs font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                >
                  <span>{nextButtonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </TiltCard>
        );
      })()}

      {/* ========================================================================= */}
      {/* STEP 6: Verify Details */}
      {/* ========================================================================= */}
      {step === 6 && (
        <TiltCard className="p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                REVIEW & CONFIRMATION
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>STEP 6: VERIFY ALL DETAILS</span>
              </h2>
            </div>
            <span className="text-xs font-bold text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30">
              STEP 6 OF 7
            </span>
          </div>

          <div className="space-y-6">
            {/* Team Overview Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-sky-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs shadow-lg">
              <div>
                <span className="text-slate-400 block uppercase text-[10px] font-bold">Team Name</span>
                <span className="font-extrabold text-white text-sm uppercase font-mono">{teamName}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px] font-bold">Registering Account</span>
                <span className="font-bold text-white font-mono">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px] font-bold">Total Fee</span>
                <span className="font-black text-cyan-300 text-base">₹{totalFee}</span>
              </div>
            </div>

            {/* Member Details Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  TEAM MEMBERS ROSTER ({members.length} MEMBERS)
                </h3>
                <span className="text-[11px] text-slate-400">Click Edit to modify any member</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((m, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 relative group hover:border-sky-500/40 transition-all">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-black flex items-center justify-center border border-cyan-500/30">
                          {i + 1}
                        </span>
                        <span className="font-bold text-white uppercase">{m.name || 'Unnamed'}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        i === 0
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {i === 0 ? 'TEAM LEAD' : `MEMBER ${i + 1}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div><span className="text-slate-500">Reg No:</span> <strong className="font-mono text-white">{m.regNo}</strong></div>
                      <div><span className="text-slate-500">Mobile:</span> <span className="font-mono">{m.mobile}</span></div>
                      <div><span className="text-slate-500">Dept:</span> {m.department} ({m.year} Year)</div>
                      <div><span className="text-slate-500">Section:</span> {m.section}</div>
                      <div className="col-span-2 text-slate-400 truncate"><span className="text-slate-500">Email:</span> {m.email}</div>
                      <div className="col-span-2 text-slate-400">
                        <span className="text-slate-500">Stay:</span> {m.accommodation}
                        {m.accommodation === 'Hosteller' && ` (${m.hostel || 'Hostel'} - Room ${m.roomNumber || 'N/A'})`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(i + 2)}
                      className="mt-2 text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Member {i + 1}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-1/3 py-3.5 text-xs font-bold text-slate-300 glass-card rounded-xl hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-2/3 py-3.5 text-xs font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.6)] cursor-pointer transition-all flex items-center justify-center gap-2 uppercase disabled:opacity-50"
              >
                <span>{loading ? 'LOCKING 5-MIN PAYMENT SLOT...' : `CONFIRM & PROCEED TO PAYMENT (₹${totalFee})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </TiltCard>
      )}

      {/* ========================================================================= */}
      {/* STEP 7: Payment (5-Minute Lock Timer) */}
      {/* ========================================================================= */}
      {step === 7 && (
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
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 font-mono">SERVER RESERVED</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Your spot is securely held for 5 minutes. Complete payment and enter the 12-digit UTR before expiration.
                </p>
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
            <span>STEP 7: BANK ACCOUNT TRANSFER & PAYMENT VERIFICATION</span>
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
                  placeholder="e.g. 402819284719"
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
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                />

                {uploadProgress > 0 && uploadProgress < 100 && (
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

                {(previewUrl || screenshotUrl) && (
                  <div className="mt-3 space-y-2">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Screenshot uploaded successfully
                    </span>
                    <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider">
                          PAYMENT RECEIPT PREVIEW
                        </span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/60 max-h-64 flex items-center justify-center p-2">
                        <img
                          src={previewUrl || screenshotUrl}
                          alt="Uploaded Payment Receipt"
                          className="w-full max-h-60 object-contain rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="w-1/3 py-4 text-xs font-bold text-slate-300 glass-card rounded-xl hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || !screenshotUrl || utr.length !== 12}
                  className="w-2/3 py-4 text-xs font-extrabold tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-cyan-400 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all disabled:opacity-50 cursor-pointer uppercase"
                >
                  {loading ? 'SUBMITTING REGISTRATION...' : 'SUBMIT REGISTRATION & CLAIM PASS'}
                </button>
              </div>
            </form>
          </div>
        </TiltCard>
      )}

      {/* ========================================================================= */}
      {/* STEP 8: Success Confirmation & Digital Event Pass */}
      {/* ========================================================================= */}
      {step === 8 && registrationResult && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="p-6 rounded-3xl glass-card border border-emerald-500/40 text-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">REGISTRATION COMPLETED SUCCESSFULLY 🎉</h2>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
              Your team registration and payment details have been recorded. Your official pass has been generated below.
            </p>
          </div>

          {/* Dedicated WhatsApp Group & Teammate Notice Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-white uppercase tracking-wider">OFFICIAL PARTICIPANTS WHATSAPP GROUP</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[9px] text-emerald-300 font-extrabold border border-emerald-400/30">MANDATORY</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Join the official WhatsApp group for live hackathon announcements, reporting schedules, and mentor access.
                  <br />
                  <strong className="text-emerald-300 font-bold">👉 Please share this invitation link with all your teammates and ensure everyone joins!</strong>
                </p>
              </div>
            </div>
            <a
              href="https://chat.whatsapp.com/BST4xC9Kdkc3ccZ30BLWYo"
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto px-7 py-4 text-xs font-black text-black bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.5)] text-center flex items-center justify-center gap-2 shrink-0 transition-all uppercase cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>JOIN WHATSAPP GROUP</span>
            </a>
          </div>

          {/* Event Pass */}
          <OfficialEventPass
            team={{
              teamName: registrationResult.teamName,
              teamId: registrationResult.teamId,
              leadName: registrationResult.leadName,
              leadEmail: registrationResult.leadEmail,
              track: track
            }}
            members={members}
            payment={{ utr: utr }}
            eventSettings={{
              venue: settings?.venue || settings?.eventVenue || 'KS AUDITORIUM',
              eventDate: settings?.eventDate || '08:30 AM, 1st October 2026'
            }}
            showActions={true}
          />

          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 text-xs font-extrabold tracking-wider text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.5)] cursor-pointer uppercase"
            >
              GO TO PARTICIPANT DASHBOARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
