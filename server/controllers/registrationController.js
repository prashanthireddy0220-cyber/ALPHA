import Team from '../models/Team.js';
import Student from '../models/Student.js';
import RegistrationReservation from '../models/RegistrationReservation.js';
import EventSettings from '../models/EventSettings.js';
import User from '../models/User.js';
import { generateNextTeamId } from '../utils/teamIdGenerator.js';

// Reserve temporary slot (10-minute timer)
export const reserveSlot = async (req, res) => {
  try {
    const settings = (await EventSettings.findOne()) || {};
    if (settings.registrationOpen === false) {
      return res.status(400).json({ message: 'Registration is currently closed by the administrator.' });
    }

    const currentTeamsCount = await Team.countDocuments();
    const activeReservationsCount = await RegistrationReservation.countDocuments();
    const totalClaimed = currentTeamsCount + activeReservationsCount;

    if (totalClaimed >= (settings.maxTeams || 100)) {
      return res.status(400).json({ message: 'Registration capacity for this event has been reached.' });
    }

    const { teamName, leadRegNo } = req.body;
    if (!teamName || !leadRegNo) {
      return res.status(400).json({ message: 'Team Name and Lead Registration Number required' });
    }

    const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const reservation = await RegistrationReservation.create({
      reservationId,
      teamName,
      leadRegNo
    });

    res.json({
      success: true,
      reservationId: reservation.reservationId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      message: 'Slot reserved for 10 minutes'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete Team Registration & Payment Submission
export const submitRegistration = async (req, res) => {
  try {
    const settings = (await EventSettings.findOne()) || {};
    if (settings.registrationOpen === false) {
      return res.status(400).json({ message: 'REGISTRATIONS CLOSED by administration' });
    }

    const currentTeamsCount = await Team.countDocuments();
    if (currentTeamsCount >= (settings.maxTeams || 100)) {
      return res.status(400).json({ message: 'REGISTRATIONS FULL! Maximum team limit reached.' });
    }

    const { teamName, members, utr, screenshotUrl, track, leadEmail } = req.body;

    if (!teamName || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Team name and member details are required' });
    }

    const expectedTeamSize = settings.teamSize || 4;
    if (members.length !== expectedTeamSize) {
      return res.status(400).json({ message: `Team must have exactly ${expectedTeamSize} members.` });
    }

    // Validate UTR: 12 numeric digits
    if (!utr || !/^\d{12}$/.test(utr)) {
      return res.status(400).json({ message: 'UTR / Transaction Number must be exactly 12 digits (numbers only).' });
    }

    if (!screenshotUrl) {
      return res.status(400).json({ message: 'Payment screenshot is required' });
    }

    // Check UTR duplicate
    const existingUtr = await Team.findOne({ 'payment.utr': utr });
    if (existingUtr) {
      return res.status(400).json({ message: 'This UTR number has already been submitted by another team.' });
    }

    // Check duplicate student registration numbers across database
    const regNos = members.map(m => m.regNo.trim().toUpperCase());
    const uniqueRegNos = new Set(regNos);
    if (uniqueRegNos.size !== regNos.length) {
      return res.status(400).json({ message: 'Duplicate registration numbers within your team entries.' });
    }

    const existingStudents = await Student.find({ regNo: { $in: regNos } });
    if (existingStudents.length > 0) {
      const duplicates = existingStudents.map(s => s.regNo).join(', ');
      return res.status(400).json({ message: `Participant(s) already registered in another team: ${duplicates}` });
    }

    // Save Students
    const studentDocs = [];
    for (const m of members) {
      const generatedEmail = `${m.regNo.toLowerCase().trim()}@klu.ac.in`;
      const student = await Student.create({
        name: m.name.trim(),
        regNo: m.regNo.trim().toUpperCase(),
        department: m.department,
        year: m.year,
        section: m.section.trim(),
        mobile: m.mobile.trim(),
        gender: m.gender,
        accommodation: m.accommodation,
        hostel: m.accommodation === 'Hosteller' ? m.hostel : 'N/A',
        roomNumber: m.accommodation === 'Hosteller' ? m.roomNumber : 'N/A',
        email: generatedEmail
      });
      studentDocs.push(student);
    }

    const teamId = await generateNextTeamId();
    const leadStudent = studentDocs[0];
    const totalAmount = expectedTeamSize * (settings.participantFee || 350);

    let userObj = null;
    if (req.user) {
      userObj = req.user._id;
    } else {
      // Find or create lead user account
      let user = await User.findOne({ email: leadStudent.email });
      if (!user) {
        user = await User.create({
          name: leadStudent.name,
          email: leadStudent.email,
          password: leadStudent.regNo, // Initial default password = regNo
          role: 'user'
        });
      }
      userObj = user._id;
    }

    const team = await Team.create({
      teamId,
      teamName: teamName.trim(),
      members: studentDocs.map(s => s._id),
      leadRegNo: leadStudent.regNo,
      leadEmail: leadStudent.email,
      payment: {
        utr,
        screenshotUrl,
        amount: totalAmount,
        status: 'PENDING',
        submittedAt: new Date()
      },
      track: track || 'General Innovation',
      user: userObj
    });

    // Update user's teamId
    await User.findByIdAndUpdate(userObj, { teamId: team.teamId });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Payment status is PENDING verification.',
      teamId: team.teamId,
      teamName: team.teamName,
      paymentStatus: team.payment.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Public Verification info (Public Route for QR verification /verify/:teamId)
// DO NOT expose UTR, screenshot, mobile, room number or passwords
export const verifyTeamPass = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findOne({ teamId: teamId.toUpperCase() })
      .populate('members', 'name regNo department year')
      .exec();

    if (!team) {
      return res.status(404).json({ valid: false, message: 'Invalid or unknown ALPHA Event Pass' });
    }

    const settings = (await EventSettings.findOne()) || {};

    res.json({
      valid: true,
      teamId: team.teamId,
      teamName: team.teamName,
      paymentStatus: team.payment.status,
      event: settings.eventName || 'ALPHA 2026',
      eventDate: settings.eventDate || 'MARCH 28 - 29, 2026',
      venue: settings.venue || 'KARE Auditorium & CSE Tech Arena',
      members: team.members.map(m => ({
        name: m.name,
        regNo: m.regNo,
        department: m.department,
        year: m.year
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Team details for dashboard
export const getMyTeam = async (req, res) => {
  try {
    let team = null;
    if (req.user.teamId) {
      team = await Team.findOne({ teamId: req.user.teamId }).populate('members');
    } else {
      team = await Team.findOne({ leadEmail: req.user.email }).populate('members');
    }

    if (!team) {
      return res.status(404).json({ message: 'No registered team found for this account.' });
    }

    const settings = (await EventSettings.findOne()) || {};

    res.json({
      team,
      eventSettings: settings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
