import Team from '../models/Team.js';
import Student from '../models/Student.js';
import RegistrationReservation from '../models/RegistrationReservation.js';
import EventSettings from '../models/EventSettings.js';
import User from '../models/User.js';
import { generateNextTeamId } from '../utils/teamIdGenerator.js';

// In-memory Mutex Lock to guarantee 100% thread-safe atomic capacity checks under heavy concurrent load
class AsyncMutex {
  constructor() {
    this.queue = [];
    this.locked = false;
  }

  acquire() {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    } else {
      this.locked = false;
    }
  }
}

const registrationMutex = new AsyncMutex();

// Helper function to validate KLU email domain (@klu.ac.in)
const isKluEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase().endsWith('@klu.ac.in');
};

// Instant validation for Team Name (Unique, no double spaces, cannot start with "Team")
export const checkTeamName = async (req, res) => {
  try {
    const rawInput = req.query.name || '';
    const trimmed = rawInput.trim();

    if (!trimmed) {
      return res.json({ valid: true, message: '' });
    }

    if (/\s{2,}/.test(rawInput)) {
      return res.status(400).json({ valid: false, message: 'Team name cannot contain two or more consecutive spaces.' });
    }

    if (/^team(\s|$)/i.test(trimmed)) {
      return res.status(400).json({ valid: false, message: "Team name cannot start with the word 'Team'." });
    }

    const escaped = trimmed.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const existingTeam = await Team.findOne({
      teamName: { $regex: new RegExp(`^${escaped}$`, 'i') }
    });

    if (existingTeam) {
      return res.status(400).json({ valid: false, message: 'This team name is already taken by another team.' });
    }

    res.json({ valid: true, message: 'Team name is available!' });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
};

// Validate Team Details & Member Data without locking a slot
export const validateDetails = async (req, res) => {
  try {
    const { teamName, members } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ message: 'Please enter a valid team name.' });
    }

    // 1. Check two or more consecutive spaces
    if (/\s{2,}/.test(teamName)) {
      return res.status(400).json({ message: 'Team name cannot contain two or more consecutive spaces.' });
    }

    // 2. First word cannot be 'Team'
    if (/^team(\s|$)/i.test(teamName.trim())) {
      return res.status(400).json({ message: "Team name cannot start with the word 'Team'." });
    }

    // 3. One team per registering account check & verify at least one member matches login account
    if (req.user) {
      const userEmail = (req.user.email || '').trim().toLowerCase();
      const userReg = userEmail.split('@')[0];

      const existingUserTeam = await Team.findOne({
        $or: [
          { user: req.user._id },
          { leadEmail: new RegExp(`^${userEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
        ]
      });
      if (existingUserTeam) {
        return res.status(400).json({
          message: `This account (${req.user.email}) has already registered a team (${existingUserTeam.teamName} - ${existingUserTeam.teamId}). Each account can only register one team.`
        });
      }

      if (members && Array.isArray(members)) {
        const hasLoginMember = members.some(m => {
          const r = (m.regNo || '').trim().toLowerCase();
          const e = (m.email || (r ? `${r}@klu.ac.in` : '')).trim().toLowerCase();
          return e === userEmail || (r && r === userReg);
        });
        if (!hasLoginMember) {
          return res.status(400).json({
            message: `At least one team member must have the registration number corresponding to your logged-in account (${req.user.email}).`
          });
        }
      }
    }

    const normalizedTeamName = teamName.trim().toUpperCase();

    // 4. Check duplicate team name (case-insensitive) in database
    const existingTeam = await Team.findOne({
      teamName: { $regex: new RegExp(`^${normalizedTeamName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
    });

    if (existingTeam) {
      return res.status(400).json({ message: 'This team name is already registered. Please choose another team name.' });
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Team member details are required.' });
    }

    // 5. Check duplicate Registration Numbers within the same team
    const regNos = members.map(m => (m.regNo || '').trim().toUpperCase()).filter(Boolean);
    const seenRegs = new Set();
    for (const r of regNos) {
      if (seenRegs.has(r)) {
        return res.status(400).json({
          message: `Duplicate Registration Number '${r}' found within your team. Each team member must have a unique Registration Number.`
        });
      }
      seenRegs.add(r);
    }

    // Validate KLU email and duplicate student participation across database strictly by Registration Number & Email
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      const email = (m.email || '').trim().toLowerCase();
      const regNo = (m.regNo || '').trim().toUpperCase();

      if (!email || !isKluEmail(email)) {
        return res.status(400).json({
          message: `Member ${i + 1}: Please use a valid KLU email address (@klu.ac.in).`
        });
      }

      if (!regNo) {
        return res.status(400).json({
          message: `Member ${i + 1}: Registration Number is required.`
        });
      }

      const cleanRegRegex = new RegExp(`^${regNo.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
      const cleanEmailRegex = new RegExp(`^${email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');

      // 1. Check Student collection for existing student with same Registration Number or Email
      const existingStudent = await Student.findOne({
        $or: [
          { regNo: cleanRegRegex },
          { email: cleanEmailRegex }
        ]
      });

      // 2. Check Team collection for existing lead student with same Registration Number or Email
      const existingTeam = await Team.findOne({
        $or: [
          { leadRegNo: cleanRegRegex },
          { leadEmail: cleanEmailRegex }
        ]
      });

      if (existingStudent) {
        // Verify if this student belongs to an ACTIVE existing team
        const activeTeamWithStudent = await Team.findOne({
          $or: [
            { members: existingStudent._id },
            { _id: existingStudent.teamId },
            { leadRegNo: cleanRegRegex },
            { leadEmail: cleanEmailRegex }
          ]
        });

        if (activeTeamWithStudent) {
          return res.status(400).json({
            message: `Student with Registration Number '${regNo}' (${m.name || 'Member ' + (i + 1)}) is ALREADY registered in team '${activeTeamWithStudent.teamName}' and cannot register again.`
          });
        } else {
          // Self-Healing: The team was deleted by admin, but student document remained orphaned. Clean it up now!
          await Student.deleteMany({
            $or: [
              { _id: existingStudent._id },
              { regNo: cleanRegRegex },
              { email: cleanEmailRegex }
            ]
          });
        }
      }

      if (existingTeam) {
        return res.status(400).json({
          message: `Student with Registration Number '${regNo}' (${m.name || 'Member ' + (i + 1)}) is ALREADY registered as lead in team '${existingTeam.teamName}'.`
        });
      }
    }

    res.json({ success: true, valid: true });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Validation failed.' });
  }
};

// Reserve temporary payment slot (ONLY WHEN ENTERING PAYMENT STAGE) - 5-minute timer
export const reservePaymentSlot = async (req, res) => {
  await registrationMutex.acquire();
  try {
    const settings = (await EventSettings.findOne()) || {};
    if (settings.registrationOpen === false) {
      return res.status(400).json({ message: 'Registration is currently closed by the administrator.' });
    }

    let { teamName, members, leadRegNo: legacyRegNo, track, reservationId: existingResId } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ message: 'Team Name and Lead Registration Number required' });
    }

    // Check two or more consecutive spaces
    if (/\s{2,}/.test(teamName)) {
      return res.status(400).json({ message: 'Team name cannot contain two or more consecutive spaces.' });
    }

    // First word cannot be 'Team'
    if (/^team(\s|$)/i.test(teamName.trim())) {
      return res.status(400).json({ message: "Team name cannot start with the word 'Team'." });
    }

    // Check if account already registered a team & verify at least one member matches login account
    if (req.user) {
      const userEmail = (req.user.email || '').trim().toLowerCase();
      const userReg = userEmail.split('@')[0];

      const existingUserTeam = await Team.findOne({
        $or: [
          { user: req.user._id },
          { leadEmail: new RegExp(`^${userEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
        ]
      });
      if (existingUserTeam) {
        return res.status(400).json({
          message: `This account (${req.user.email}) has already registered a team (${existingUserTeam.teamName}). Each account can only register one team.`
        });
      }

      if (members && Array.isArray(members)) {
        const hasLoginMember = members.some(m => {
          const r = (m.regNo || '').trim().toLowerCase();
          const e = (m.email || (r ? `${r}@klu.ac.in` : '')).trim().toLowerCase();
          return e === userEmail || (r && r === userReg);
        });
        if (!hasLoginMember) {
          return res.status(400).json({
            message: `At least one team member must have the registration number corresponding to your logged-in account (${req.user.email}).`
          });
        }
      }
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      if (legacyRegNo) {
        const cleanReg = legacyRegNo.trim().toUpperCase();
        members = [{ regNo: cleanReg, email: `${cleanReg.toLowerCase()}@klu.ac.in` }];
      } else {
        return res.status(400).json({ message: 'Team details and member information are required.' });
      }
    }

    // Check duplicate Registration Numbers within the team
    const regNos = members.map(m => (m.regNo || '').trim().toUpperCase()).filter(Boolean);
    const seenRegs = new Set();
    for (const r of regNos) {
      if (seenRegs.has(r)) {
        return res.status(400).json({
          message: `Duplicate Registration Number '${r}' found in your team. Each team member must have a unique Registration Number.`
        });
      }
      seenRegs.add(r);
    }

    const normalizedTeamName = teamName.trim().toUpperCase();
    const leadEmail = (members[0].email || '').trim().toLowerCase();
    const leadRegNo = (members[0].regNo || '').trim().toUpperCase();

    if (!isKluEmail(leadEmail)) {
      return res.status(400).json({ message: 'Please use your KLU email address (@klu.ac.in) to continue.' });
    }

    // Check duplicate team name in Teams collection
    const existingTeam = await Team.findOne({
      teamName: { $regex: new RegExp(`^${normalizedTeamName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
    });
    if (existingTeam) {
      return res.status(400).json({ message: 'This team name is already registered. Please choose another team name.' });
    }

    // Capacity Check: Clean up expired reservations first
    await RegistrationReservation.deleteMany({ expiresAt: { $lt: new Date() } });

    const currentTeamsCount = await Team.countDocuments();
    const activeReservationsCount = await RegistrationReservation.countDocuments({
      expiresAt: { $gt: new Date() },
      reservationId: { $ne: existingResId }
    });

    const totalClaimed = currentTeamsCount + activeReservationsCount;
    const maxTeams = settings.maxTeams || 100;

    if (totalClaimed >= maxTeams) {
      return res.status(400).json({ message: 'Registration capacity for this event has been reached.' });
    }

    // Normalize member names and sections to UPPERCASE
    const normalizedMembers = members.map(m => ({
      ...m,
      name: (m.name || '').trim().toUpperCase(),
      regNo: (m.regNo || '').trim().toUpperCase(),
      section: (m.section || '').trim().toUpperCase(),
      email: (m.email || '').trim().toLowerCase()
    }));

    let reservation = null;
    if (existingResId) {
      reservation = await RegistrationReservation.findOne({ reservationId: existingResId });
    }

    // If reservation exists and is active, maintain original expiration time across refresh!
    if (reservation && reservation.expiresAt > new Date()) {
      reservation.teamName = normalizedTeamName;
      reservation.leadEmail = leadEmail;
      reservation.leadRegNo = leadRegNo;
      reservation.membersData = normalizedMembers;
      reservation.track = track || 'General Innovation';
      await reservation.save();
    } else {
      // Create new 5-minute reservation
      const reservationId = existingResId || `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      reservation = await RegistrationReservation.create({
        reservationId,
        teamName: normalizedTeamName,
        leadEmail,
        leadRegNo,
        membersData: normalizedMembers,
        track: track || 'General Innovation',
        expiresAt
      });
    }

    const remainingSeconds = Math.max(0, Math.floor((new Date(reservation.expiresAt).getTime() - Date.now()) / 1000));

    res.json({
      success: true,
      reservationId: reservation.reservationId,
      expiresAt: reservation.expiresAt,
      remainingSeconds,
      message: 'Slot reserved for 5 minutes.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    registrationMutex.release();
  }
};

// Get Reservation Status for Page Refresh persistence
export const getReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await RegistrationReservation.findOne({ reservationId });

    if (!reservation || new Date(reservation.expiresAt) <= new Date()) {
      if (reservation) {
        await RegistrationReservation.deleteOne({ _id: reservation._id });
      }
      return res.status(400).json({
        expired: true,
        message: 'Your payment session has expired. Please start the payment process again.'
      });
    }

    const remainingSeconds = Math.max(0, Math.floor((new Date(reservation.expiresAt).getTime() - Date.now()) / 1000));

    res.json({
      valid: true,
      expired: false,
      reservationId: reservation.reservationId,
      expiresAt: reservation.expiresAt,
      remainingSeconds,
      teamName: reservation.teamName,
      leadEmail: reservation.leadEmail,
      membersData: reservation.membersData,
      track: reservation.track
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete Team Registration & Payment Submission
export const submitRegistration = async (req, res) => {
  await registrationMutex.acquire();
  try {
    const settings = (await EventSettings.findOne()) || {};
    if (settings.registrationOpen === false) {
      return res.status(400).json({ message: 'Registrations are currently closed by the administration.' });
    }

    const { teamName, members, utr, screenshotUrl, track, reservationId } = req.body;

    if (!teamName || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Team name and member details are required.' });
    }

    // Check two or more consecutive spaces
    if (/\s{2,}/.test(teamName)) {
      return res.status(400).json({ message: 'Team name cannot contain two or more consecutive spaces.' });
    }

    // First word cannot be 'Team'
    if (/^team(\s|$)/i.test(teamName.trim())) {
      return res.status(400).json({ message: "Team name cannot start with the word 'Team'." });
    }

    // Check if account already registered a team & verify at least one member matches login account
    if (req.user) {
      const userEmail = (req.user.email || '').trim().toLowerCase();
      const userReg = userEmail.split('@')[0];

      const existingUserTeam = await Team.findOne({
        $or: [
          { user: req.user._id },
          { leadEmail: new RegExp(`^${userEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
        ]
      });
      if (existingUserTeam) {
        return res.status(400).json({
          message: `This account (${req.user.email}) has already registered a team (${existingUserTeam.teamName} - ${existingUserTeam.teamId}). Each account can only register one team.`
        });
      }

      if (members && Array.isArray(members)) {
        const hasLoginMember = members.some(m => {
          const r = (m.regNo || '').trim().toLowerCase();
          const e = (m.email || (r ? `${r}@klu.ac.in` : '')).trim().toLowerCase();
          return e === userEmail || (r && r === userReg);
        });
        if (!hasLoginMember) {
          return res.status(400).json({
            message: `At least one team member must have the registration number corresponding to your logged-in account (${req.user.email}).`
          });
        }
      }
    }

    // Check duplicate Registration Numbers within the team
    const regNos = members.map(m => (m.regNo || '').trim().toUpperCase()).filter(Boolean);
    const seenRegs = new Set();
    for (const r of regNos) {
      if (seenRegs.has(r)) {
        return res.status(400).json({
          message: `Duplicate Registration Number '${r}' found within your team. Each team member must have a unique Registration Number.`
        });
      }
      seenRegs.add(r);
    }

    const normalizedTeamName = teamName.trim().toUpperCase();

    // Check UTR validation: 12 numeric digits
    if (!utr || !/^\d{12}$/.test(utr.trim())) {
      return res.status(400).json({ message: 'UTR / Transaction Number must be exactly 12 digits (numbers only).' });
    }

    if (!screenshotUrl) {
      return res.status(400).json({ message: 'Payment screenshot is required.' });
    }

    // Capacity Check inside submitRegistration if reservation is missing or expired
    let hasValidReservation = false;
    if (reservationId) {
      const activeRes = await RegistrationReservation.findOne({
        reservationId,
        expiresAt: { $gt: new Date() }
      });
      if (activeRes) {
        hasValidReservation = true;
      }
    }

    if (!hasValidReservation) {
      await RegistrationReservation.deleteMany({ expiresAt: { $lt: new Date() } });
      const currentTeamsCount = await Team.countDocuments();
      const activeReservationsCount = await RegistrationReservation.countDocuments({
        expiresAt: { $gt: new Date() }
      });
      const totalClaimed = currentTeamsCount + activeReservationsCount;
      const maxTeams = settings.maxTeams || 100;

      if (totalClaimed >= maxTeams) {
        return res.status(400).json({ message: 'Registration capacity for this event has been reached.' });
      }
    }

    // Check UTR duplicate
    const existingUtr = await Team.findOne({ 'payment.utr': utr.trim() });
    if (existingUtr) {
      return res.status(400).json({ message: 'This UTR number has already been submitted by another team.' });
    }

    // Check Team Name duplicate in Teams collection
    const existingTeam = await Team.findOne({
      teamName: { $regex: new RegExp(`^${normalizedTeamName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }
    });
    if (existingTeam) {
      return res.status(400).json({ message: 'This team name is already registered. Please choose another team name.' });
    }

    // Validate KLU emails and duplicate student entries strictly by Registration Number & Email
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      const email = (m.email || '').trim().toLowerCase();
      const regNo = (m.regNo || '').trim().toUpperCase();

      if (!email || !isKluEmail(email)) {
        return res.status(400).json({ message: `Member ${i + 1}: Please use a valid KLU email address (@klu.ac.in).` });
      }

      if (!regNo) {
        return res.status(400).json({ message: `Member ${i + 1}: Registration Number is required.` });
      }

      const cleanRegRegex = new RegExp(`^${regNo.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
      const cleanEmailRegex = new RegExp(`^${email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');

      const existingStudent = await Student.findOne({
        $or: [
          { regNo: cleanRegRegex },
          { email: cleanEmailRegex }
        ]
      });

      const existingTeam = await Team.findOne({
        $or: [
          { leadRegNo: cleanRegRegex },
          { leadEmail: cleanEmailRegex }
        ]
      });

      if (existingStudent) {
        // Verify if this student belongs to an ACTIVE existing team
        const activeTeamWithStudent = await Team.findOne({
          $or: [
            { members: existingStudent._id },
            { _id: existingStudent.teamId },
            { leadRegNo: cleanRegRegex },
            { leadEmail: cleanEmailRegex }
          ]
        });

        if (activeTeamWithStudent) {
          return res.status(400).json({
            message: `Student with Registration Number '${regNo}' (${m.name || 'Member ' + (i + 1)}) is ALREADY registered in team '${activeTeamWithStudent.teamName}' and cannot register again.`
          });
        } else {
          // Self-Healing: The team was deleted by admin, but student document remained orphaned. Clean it up now!
          await Student.deleteMany({
            $or: [
              { _id: existingStudent._id },
              { regNo: cleanRegRegex },
              { email: cleanEmailRegex }
            ]
          });
        }
      }

      if (existingTeam) {
        return res.status(400).json({
          message: `Student with Registration Number '${regNo}' (${m.name || 'Member ' + (i + 1)}) is ALREADY registered as lead in team '${existingTeam.teamName}'.`
        });
      }
    }

    // Create / Save Students with UPPERCASE Name & Section, Lowercase Email
    const studentDocs = [];
    for (const m of members) {
      const cleanRegNo = (m.regNo || '').trim().toUpperCase();
      let email = (m.email || '').trim().toLowerCase();
      if (!email && cleanRegNo) {
        email = `${cleanRegNo.toLowerCase()}@klu.ac.in`;
      }
      const student = await Student.create({
        name: (m.name || '').trim().toUpperCase(),
        regNo: cleanRegNo,
        department: m.department,
        year: m.year,
        section: (m.section || '').trim().toUpperCase(),
        mobile: (m.mobile || '').trim(),
        gender: m.gender,
        accommodation: m.accommodation,
        hostel: m.accommodation === 'Hosteller' ? m.hostel : 'N/A',
        roomNumber: m.accommodation === 'Hosteller' ? m.roomNumber : 'N/A',
        email
      });
      studentDocs.push(student);
    }

    // Generate Next Sequential ALPHAA 001 Team ID
    const teamId = await generateNextTeamId();
    const leadStudent = studentDocs[0];
    const expectedTeamSize = settings.teamSize || 4;
    const totalAmount = expectedTeamSize * (settings.participantFee || 350);

    let userObj = null;
    if (req.user) {
      userObj = req.user._id;
    } else {
      let user = await User.findOne({ email: leadStudent.email });
      if (!user) {
        user = await User.create({
          name: leadStudent.name,
          email: leadStudent.email,
          password: leadStudent.regNo,
          role: 'user'
        });
      }
      userObj = user._id;
    }

    const team = await Team.create({
      teamId,
      teamName: normalizedTeamName,
      members: studentDocs.map(s => s._id),
      leadRegNo: leadStudent.regNo,
      leadEmail: leadStudent.email,
      payment: {
        utr: utr.trim(),
        screenshotUrl,
        amount: totalAmount,
        status: 'PENDING',
        submittedAt: new Date()
      },
      track: track || 'General Innovation',
      user: userObj
    });

    await User.findByIdAndUpdate(userObj, { teamId: team.teamId });
    if (leadStudent.email) {
      await User.findOneAndUpdate({ email: leadStudent.email.toLowerCase() }, { teamId: team.teamId }).exec().catch(() => {});
    }

    // Clean up temporary reservation if present
    if (reservationId) {
      await RegistrationReservation.deleteOne({ reservationId });
    }

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully.',
      teamId: team.teamId,
      teamName: team.teamName,
      leadEmail: team.leadEmail,
      leadName: leadStudent.name,
      paymentStatus: team.payment.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    registrationMutex.release();
  }
};

// Get Public Verification info for QR verification (/verify/:teamId)
export const verifyTeamPass = async (req, res) => {
  try {
    const { teamId } = req.params;
    const cleanId = teamId.replace(/-/g, ' ').toUpperCase();
    const team = await Team.findOne({
      $or: [
        { teamId: cleanId },
        { teamId: teamId.toUpperCase() }
      ]
    })
      .populate('members', 'name regNo department year section email')
      .exec();

    if (!team) {
      return res.status(404).json({ valid: false, message: 'Invalid or unknown ALPHA Event Pass' });
    }

    const settings = (await EventSettings.findOne()) || {};

    res.json({
      valid: true,
      teamId: team.teamId,
      teamName: team.teamName,
      leadEmail: team.leadEmail,
      leadRegNo: team.leadRegNo,
      paymentStatus: team.payment.status,
      utr: team.payment.utr,
      event: settings.eventName || 'ALPHA 2026',
      eventDate: settings.eventDate || 'OCTOBER 1 - 2, 2026',
      venue: settings.venue || 'KS AUDITORIUM',
      members: team.members.map(m => ({
        name: m.name,
        regNo: m.regNo,
        department: m.department,
        year: m.year,
        section: m.section,
        email: m.email
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Team details for participant dashboard (High-Performance Parallel Lookup)
export const getMyTeam = async (req, res) => {
  try {
    const userEmail = (req.user?.email || '').trim().toLowerCase();
    const userRegNo = userEmail.split('@')[0].toUpperCase();

    let team = null;

    // 1. Direct teamId match on User model if available
    if (req.user.teamId) {
      team = await Team.findOne({
        $or: [
          { teamId: req.user.teamId },
          { teamId: req.user.teamId.toUpperCase() }
        ]
      }).populate('members').lean();
    }

    // 2. High-speed combined indexed search across Student and Team collections
    if (!team) {
      const emailRegex = userEmail ? new RegExp(`^${userEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') : null;
      const regNoRegex = userRegNo ? new RegExp(`^${userRegNo.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') : null;

      const studentDocs = await Student.find({
        $or: [
          ...(emailRegex ? [{ email: emailRegex }] : []),
          ...(regNoRegex ? [{ regNo: regNoRegex }] : [])
        ]
      }).select('_id').lean();

      const studentIds = studentDocs.map(s => s._id);

      team = await Team.findOne({
        $or: [
          ...(emailRegex ? [{ leadEmail: emailRegex }] : []),
          ...(regNoRegex ? [{ leadRegNo: regNoRegex }] : []),
          ...(req.user._id ? [{ user: req.user._id }] : []),
          ...(studentIds.length > 0 ? [{ members: { $in: studentIds } }] : [])
        ]
      }).populate('members').lean();
    }

    if (!team) {
      if (req.user && req.user._id) {
        User.findByIdAndUpdate(req.user._id, { $unset: { teamId: 1 } }).exec().catch(() => {});
      }
      return res.status(404).json({ message: 'No registered team found for this account. Please register your team.' });
    }

    // Background non-blocking sync of teamId on User model if missing
    if (req.user._id && (!req.user.teamId || req.user.teamId !== team.teamId)) {
      User.findByIdAndUpdate(req.user._id, { teamId: team.teamId }).exec().catch(() => {});
    }

    const settings = (await EventSettings.findOne().lean()) || {};

    res.json({
      team,
      eventSettings: settings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public Capacity Stats Endpoint (accessible to all homepage visitors)
export const getPublicCapacityStats = async (req, res) => {
  try {
    const settings = (await EventSettings.findOne().lean()) || {};
    const totalTeams = await Team.countDocuments();
    const activeReservations = await RegistrationReservation.countDocuments({
      expiresAt: { $gt: new Date() }
    });

    const maxTeams = settings.maxTeams || 100;
    const availableSlots = Math.max(0, maxTeams - totalTeams - activeReservations);

    res.json({
      totalTeams,
      maxTeams,
      availableSlots,
      activeReservations,
      registrationOpen: settings.registrationOpen !== false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


