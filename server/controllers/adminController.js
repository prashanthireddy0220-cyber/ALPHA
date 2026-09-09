import Team from '../models/Team.js';
import Student from '../models/Student.js';
import RegistrationReservation from '../models/RegistrationReservation.js';
import EventSettings from '../models/EventSettings.js';
import PaymentAudit from '../models/PaymentAudit.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import AttendanceSession from '../models/AttendanceSession.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';

export const getAdminStats = async (req, res) => {
  try {
    const settings = (await EventSettings.findOne()) || { maxTeams: 100, registrationOpen: true };
    const totalTeams = await Team.countDocuments();
    const totalParticipants = await Student.countDocuments();
    const activeReservations = await RegistrationReservation.countDocuments();
    const availableSlots = Math.max(0, settings.maxTeams - totalTeams - activeReservations);

    const pendingPayments = await Team.countDocuments({ 'payment.status': 'PENDING' });
    const verifiedPayments = await Team.countDocuments({ 'payment.status': 'VERIFIED' });
    const rejectedPayments = await Team.countDocuments({ 'payment.status': 'REJECTED' });

    res.json({
      totalTeams,
      totalParticipants,
      maxTeams: settings.maxTeams,
      availableSlots,
      activeReservations,
      pendingPayments,
      verifiedPayments,
      rejectedPayments,
      registrationOpen: settings.registrationOpen !== false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comprehensive Analytics & Command Center Metrics Endpoint
export const getAdminAnalytics = async (req, res) => {
  try {
    const settings = (await EventSettings.findOne()) || {
      maxTeams: 100,
      registrationOpen: true,
      participantFee: 350,
      teamSize: 4
    };

    const teams = await Team.find().populate('members').exec();
    const students = await Student.find().exec();
    const sessions = await AttendanceSession.find().exec();
    const logs = await AttendanceRecord.find().exec();
    const auditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(15).exec();

    const totalTeams = teams.length;
    const totalStudents = students.length;

    const pendingTeams = teams.filter(t => t.payment?.status === 'PENDING').length;
    const verifiedTeams = teams.filter(t => t.payment?.status === 'VERIFIED').length;
    const rejectedTeams = teams.filter(t => t.payment?.status === 'REJECTED').length;

    // Unique present students
    const uniquePresentRegNos = new Set(logs.map(l => l.regNo.toUpperCase()));
    const presentParticipantsCount = uniquePresentRegNos.size;

    const attendancePercentage = totalStudents > 0
      ? parseFloat(((presentParticipantsCount / totalStudents) * 100).toFixed(1))
      : 0;

    // Department Breakdown
    const deptMap = {};
    students.forEach(s => {
      const d = (s.department || 'CSE').toUpperCase();
      deptMap[d] = (deptMap[d] || 0) + 1;
    });
    const departmentBreakdown = Object.keys(deptMap).map(dept => ({
      name: dept,
      count: deptMap[dept]
    }));

    // Year Breakdown
    const yearMap = {};
    students.forEach(s => {
      const y = s.year || 'III Year';
      yearMap[y] = (yearMap[y] || 0) + 1;
    });
    const yearBreakdown = Object.keys(yearMap).map(y => ({
      name: y,
      count: yearMap[y]
    }));

    // Daily Growth (Last 14 Days)
    const dailyMap = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = { date: dateStr, teams: 0, participants: 0 };
    }

    teams.forEach(t => {
      const dateStr = new Date(t.createdAt || Date.now()).toISOString().split('T')[0];
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].teams += 1;
        dailyMap[dateStr].participants += (t.members?.length || 1);
      }
    });

    const dailyGrowth = Object.values(dailyMap);

    // Gender Breakdown
    const genderMap = { Male: 0, Female: 0 };
    students.forEach(s => {
      const g = (s.gender || 'Male').toLowerCase() === 'female' ? 'Female' : 'Male';
      genderMap[g] = (genderMap[g] || 0) + 1;
    });
    const genderBreakdown = Object.keys(genderMap).map(g => ({
      name: g,
      count: genderMap[g]
    }));

    // Accommodation Breakdown
    const accomMap = { Hosteller: 0, 'Day Scholar': 0 };
    students.forEach(s => {
      const a = (s.accommodation || 'Day Scholar').toLowerCase().includes('hostel') ? 'Hosteller' : 'Day Scholar';
      accomMap[a] = (accomMap[a] || 0) + 1;
    });
    const accommodationBreakdown = Object.keys(accomMap).map(a => ({
      name: a,
      count: accomMap[a]
    }));

    const activeReservations = await RegistrationReservation.countDocuments({ expiresAt: { $gt: new Date() } });
    const availableSlots = Math.max(0, (settings.maxTeams || 100) - totalTeams - activeReservations);

    // Event Lifecycle Workflow Stage Counts
    const workflowStages = [
      { id: 'registration', name: 'REGISTRATION', count: totalStudents, label: 'Submitted Registrations' },
      { id: 'verification', name: 'VERIFICATION', count: pendingTeams + verifiedTeams, label: 'Payment Under Verification' },
      { id: 'approval', name: 'APPROVAL', count: verifiedTeams, label: 'Admin Verified Teams' },
      { id: 'confirmation', name: 'CONFIRMATION', count: verifiedTeams, label: 'Passes Issued' },
      { id: 'team_formation', name: 'TEAM FORMATION', count: teams.filter(t => (t.members?.length || 0) >= (settings.teamSize || 4)).length, label: 'Complete Teams' },
      { id: 'session_attendance', name: 'SESSION ATTENDANCE', count: logs.length, label: 'Scanned Checkpoints' },
      { id: 'event_participation', name: 'EVENT PARTICIPATION', count: presentParticipantsCount, label: 'Active Participants' },
      { id: 'completion', name: 'COMPLETION', count: Math.round(presentParticipantsCount * 0.9), label: 'Final Certificates Ready' }
    ];

    // Session Progress
    const sessionProgress = sessions.map(s => {
      const sessionLogs = logs.filter(l => l.sessionId?.toString() === s._id.toString());
      return {
        _id: s._id,
        name: s.name,
        date: s.date,
        status: s.status,
        presentCount: sessionLogs.length || s.presentCount || 0,
        expectedCount: s.expectedParticipants || totalStudents || 250,
        percentage: totalStudents > 0 ? parseFloat(((sessionLogs.length / totalStudents) * 100).toFixed(1)) : 0
      };
    });

    res.json({
      settings: {
        registrationOpen: settings.registrationOpen !== false,
        maxTeams: settings.maxTeams || 100,
        participantFee: settings.participantFee || 350,
        teamSize: settings.teamSize || 4,
        officialUpiId: settings.officialUpiId || '63897781@ybl',
        officialWhatsappGroup: settings.officialWhatsappGroup || '',
        qrScannerImageUrl: settings.qrScannerImageUrl || '/assets/payment_qr.png'
      },
      stats: {
        totalRegistrations: totalTeams,
        confirmedParticipants: verifiedTeams * (settings.teamSize || 4) || totalStudents,
        pendingRegistrations: pendingTeams,
        totalTeams,
        confirmedTeams: verifiedTeams,
        activeReservations,
        availableSlots,
        totalParticipants: totalStudents,
        pendingCount: pendingTeams,
        verifiedCount: verifiedTeams,
        rejectedCount: rejectedTeams,
        presentParticipants: presentParticipantsCount,
        attendancePercentage,
        registrationStatus: settings.registrationOpen !== false ? 'OPEN' : 'CLOSED',
        verifiedTeams,
        rejectedTeams
      },
      dailyGrowth,
      departmentBreakdown,
      yearBreakdown,
      genderBreakdown,
      accommodationBreakdown,
      workflowStages,
      sessionProgress,
      recentActivity: auditLogs.map(a => ({
        id: a._id,
        action: a.action,
        performedBy: a.performedBy,
        details: a.details,
        timestamp: a.timestamp || a.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminTeams = async (req, res) => {
  try {
    const { search, status, department, year, accommodation } = req.query;

    let query = {};

    if (status) {
      query['payment.status'] = status;
    }

    let teams = await Team.find(query)
      .populate('members')
      .sort({ createdAt: -1 })
      .exec();

    if (search) {
      const q = search.toLowerCase().trim();
      teams = teams.filter(t => 
        t.teamId.toLowerCase().includes(q) ||
        t.teamName.toLowerCase().includes(q) ||
        t.leadEmail.toLowerCase().includes(q) ||
        t.payment.utr.toLowerCase().includes(q) ||
        t.members.some(m => m.name.toLowerCase().includes(q) || m.regNo.toLowerCase().includes(q))
      );
    }

    if (department) {
      teams = teams.filter(t => t.members.some(m => m.department === department));
    }

    if (year) {
      teams = teams.filter(t => t.members.some(m => m.year === year));
    }

    if (accommodation) {
      teams = teams.filter(t => t.members.some(m => m.accommodation === accommodation));
    }

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const adminEmail = req.user?.email || 'admin@alpha.klu.ac.in';

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const previousStatus = team.payment.status;
    team.payment.status = status;

    if (status === 'REJECTED') {
      team.payment.rejectionReason = rejectionReason || 'Payment details could not be verified by admin.';
    } else if (status === 'VERIFIED') {
      team.payment.rejectionReason = '';
      team.payment.verifiedAt = new Date();
    }

    await team.save();

    // Create Audit Trail Record
    await PaymentAudit.create({
      teamId: team.teamId,
      adminEmail,
      previousStatus,
      newStatus: status,
      reason: rejectionReason || '',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Payment status updated to ${status}`,
      team
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentAudits = async (req, res) => {
  try {
    const audits = await PaymentAudit.find().sort({ timestamp: -1 }).exec();
    res.json(audits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify All Pending Payments
export const verifyAllPayments = async (req, res) => {
  try {
    const adminEmail = req.user?.email || 'admin@alpha.klu.ac.in';
    const result = await Team.updateMany(
      { 'payment.status': { $ne: 'VERIFIED' } },
      { 
        $set: { 
          'payment.status': 'VERIFIED',
          'payment.verifiedAt': new Date(),
          'payment.rejectionReason': ''
        } 
      }
    );

    await PaymentAudit.create({
      teamId: 'ALL',
      adminEmail,
      previousStatus: 'PENDING',
      newStatus: 'VERIFIED',
      reason: 'Bulk verify all registrations by admin',
      timestamp: new Date()
    });

    res.json({ success: true, message: `Successfully verified ${result.modifiedCount} registration records.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete All Student & Team Registrations
export const deleteAllRegistrations = async (req, res) => {
  try {
    await Student.deleteMany({});
    await Team.deleteMany({});
    await RegistrationReservation.deleteMany({});

    res.json({ success: true, message: 'All student registration records deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Single Registration / Team
export const deleteSingleRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Registration record not found' });
    }

    if (team.members && team.members.length > 0) {
      await Student.deleteMany({ _id: { $in: team.members } });
    }

    await Team.findByIdAndDelete(id);

    res.json({ success: true, message: `Registration record ${team.teamId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Direct Registration from Admin
export const directRegistration = async (req, res) => {
  try {
    const { studentName, regNo, department, year, section, mobile, email, utr, track, status } = req.body;

    if (!studentName || !regNo) {
      return res.status(400).json({ message: 'Student Name and Reg No are required' });
    }

    const count = await Team.countDocuments();
    const teamId = `ALPHA-${1000 + count + 1}`;

    const student = await Student.create({
      name: studentName.trim(),
      regNo: regNo.trim().toUpperCase(),
      department: department || 'CSE',
      year: year || 'III',
      section: section || 'A',
      mobile: mobile || '9999999999',
      gender: 'Male',
      accommodation: 'Day Scholar'
    });

    const leadEmail = email || `${regNo.trim().toLowerCase()}@klu.ac.in`;

    const team = await Team.create({
      teamId,
      teamName: `${studentName.trim()}'s Team`,
      track: track || 'General Innovation',
      leadEmail,
      leadRegNo: regNo.trim().toUpperCase(),
      members: [student._id],
      payment: {
        amount: 350,
        utr: utr || `DIR${Date.now().toString().slice(-8)}`,
        screenshotUrl: '/assets/payment_qr.png',
        status: status || 'VERIFIED',
        verifiedAt: status === 'VERIFIED' ? new Date() : null
      }
    });

    student.teamId = team._id;
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Direct Registration created successfully!',
      teamId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Team Details (Edit Modal)
export const updateTeamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, leadEmail, leadRegNo, utr, amount, status } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (teamName) team.teamName = teamName.trim().toUpperCase();
    if (leadEmail) team.leadEmail = leadEmail.trim().toLowerCase();
    if (leadRegNo) team.leadRegNo = leadRegNo.trim().toUpperCase();
    if (utr) team.payment.utr = utr.trim();
    if (amount !== undefined) team.payment.amount = Number(amount);
    if (status) {
      team.payment.status = status;
      if (status === 'VERIFIED') team.payment.verifiedAt = new Date();
    }

    await team.save();

    res.json({
      success: true,
      message: `Team ${team.teamId} updated successfully!`,
      team
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

