import Team from '../models/Team.js';
import Student from '../models/Student.js';
import RegistrationReservation from '../models/RegistrationReservation.js';
import EventSettings from '../models/EventSettings.js';
import PaymentAudit from '../models/PaymentAudit.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import AttendanceSession from '../models/AttendanceSession.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import HelpRequest from '../models/HelpRequest.js';
import { generateNextTeamId } from '../utils/teamIdGenerator.js';

export const getAdminStats = async (req, res) => {
  try {
    const [
      settings,
      totalTeams,
      totalParticipants,
      activeReservations,
      pendingPayments,
      verifiedPayments,
      rejectedPayments
    ] = await Promise.all([
      EventSettings.findOne().lean(),
      Team.countDocuments(),
      Student.countDocuments(),
      RegistrationReservation.countDocuments(),
      Team.countDocuments({ 'payment.status': 'PENDING' }),
      Team.countDocuments({ 'payment.status': 'VERIFIED' }),
      Team.countDocuments({ 'payment.status': 'REJECTED' })
    ]);

    const maxTeams = settings?.maxTeams || 100;
    const availableSlots = Math.max(0, maxTeams - totalTeams - activeReservations);

    res.json({
      totalTeams,
      totalParticipants,
      maxTeams,
      availableSlots,
      activeReservations,
      pendingPayments,
      verifiedPayments,
      rejectedPayments,
      registrationOpen: settings?.registrationOpen !== false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comprehensive Analytics & Command Center Metrics Endpoint (High Performance Parallel Lookup)
export const getAdminAnalytics = async (req, res) => {
  try {
    const [
      settingsData,
      teams,
      students,
      sessions,
      logs,
      auditLogs
    ] = await Promise.all([
      EventSettings.findOne().lean(),
      Team.find().populate('members').lean().exec(),
      Student.find().lean().exec(),
      AttendanceSession.find().lean().exec(),
      AttendanceRecord.find().lean().exec(),
      AuditLog.find().sort({ createdAt: -1 }).limit(15).lean().exec()
    ]);

    const settings = settingsData || {
      maxTeams: 100,
      registrationOpen: true,
      participantFee: 350,
      teamSize: 4
    };

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
    await AttendanceRecord.deleteMany({});
    await Attendance.deleteMany({});
    await HelpRequest.deleteMany({});
    await User.updateMany({}, { $unset: { teamId: 1 } });

    res.json({ success: true, message: 'All student registration records, teams, and reservations deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Single Registration / Team (Complete Cascade & Orphan Cleanup)
export const deleteSingleRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Registration record not found' });
    }

    const memberIds = team.members || [];
    const leadEmail = (team.leadEmail || '').trim().toLowerCase();
    const leadRegNo = (team.leadRegNo || '').trim().toUpperCase();
    const teamName = (team.teamName || '').trim().toUpperCase();
    const rawTeamId = (team.teamId || '').trim();

    // 1. Find all student documents associated with this team
    const memberStudents = await Student.find({
      $or: [
        { _id: { $in: memberIds } },
        { teamId: team._id },
        ...(leadEmail ? [{ email: new RegExp(`^${leadEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }] : []),
        ...(leadRegNo ? [{ regNo: new RegExp(`^${leadRegNo.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }] : [])
      ]
    });

    const allStudentIds = memberStudents.map(s => s._id);
    const allRegNos = memberStudents.map(s => (s.regNo || '').trim().toUpperCase()).filter(Boolean);
    const allEmails = memberStudents.map(s => (s.email || '').trim().toLowerCase()).filter(Boolean);
    if (leadEmail && !allEmails.includes(leadEmail)) allEmails.push(leadEmail);

    // 2. Delete all these Student documents completely
    await Student.deleteMany({
      $or: [
        { _id: { $in: allStudentIds } },
        { teamId: team._id },
        ...(allRegNos.length > 0 ? [{ regNo: { $in: allRegNos.map(r => new RegExp(`^${r.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i')) } }] : []),
        ...(allEmails.length > 0 ? [{ email: { $in: allEmails.map(e => new RegExp(`^${e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i')) } }] : [])
      ]
    });

    // 3. Delete all reservations associated with this team or any of its members
    await RegistrationReservation.deleteMany({
      $or: [
        { teamId: team._id },
        ...(teamName ? [{ teamName: new RegExp(`^${teamName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }] : []),
        ...(leadEmail ? [{ leadEmail: new RegExp(`^${leadEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }] : []),
        ...(leadRegNo ? [{ leadRegNo: new RegExp(`^${leadRegNo.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') }] : []),
        ...(allEmails.length > 0 ? [{ leadEmail: { $in: allEmails.map(e => new RegExp(`^${e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i')) } }] : []),
        ...(allRegNos.length > 0 ? [{ leadRegNo: { $in: allRegNos.map(r => new RegExp(`^${r.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i')) } }] : [])
      ]
    });

    // 4. Unset teamId reference on all affected User accounts (lead and all teammates)
    const emailRegexList = allEmails.map(e => new RegExp(`^${e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i'));
    const teamIdVariations = [
      rawTeamId,
      rawTeamId.replace(/-/g, ' '),
      rawTeamId.replace(/\s+/g, '-'),
      rawTeamId.replace(/^ALPHA/i, 'ALPHAA'),
      rawTeamId.replace(/^ALPHAA/i, 'ALPHA')
    ].filter(Boolean);

    await User.updateMany(
      {
        $or: [
          { teamId: { $in: teamIdVariations } },
          { teamId: team._id },
          ...(team.user ? [{ _id: team.user }] : []),
          ...(emailRegexList.length > 0 ? [{ email: { $in: emailRegexList } }] : [])
        ]
      },
      { $unset: { teamId: 1 } }
    );

    // 5. Delete any attendance records & help requests associated with this team
    if (rawTeamId) {
      await AttendanceRecord.deleteMany({ teamId: { $in: teamIdVariations } });
      await Attendance.deleteMany({ teamId: { $in: teamIdVariations } });
      await HelpRequest.deleteMany({ teamId: { $in: teamIdVariations } });
    }

    // 6. Delete the Team document
    await Team.findByIdAndDelete(id);

    res.json({ success: true, message: `Registration record ${team.teamId} and all associated member profiles deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Direct Registration from Admin
export const directRegistration = async (req, res) => {
  try {
    const { 
      teamName, 
      track, 
      members, 
      utr, 
      amount, 
      screenshotUrl, 
      status,
      // Legacy fallback fields
      studentName, 
      regNo, 
      department, 
      year, 
      section, 
      mobile, 
      email,
      gender,
      accommodation,
      hostel,
      roomNumber
    } = req.body;

    let memberList = [];

    if (members && Array.isArray(members) && members.length > 0) {
      memberList = members.filter(m => m && (m.name?.trim() || m.regNo?.trim()));
    } else if (studentName || regNo) {
      memberList = [{
        name: studentName,
        regNo,
        department: department || 'CSE',
        year: year || 'III',
        section: section || 'A',
        mobile: mobile || '9999999999',
        email: email || (regNo ? `${regNo.toLowerCase()}@klu.ac.in` : ''),
        gender: gender || 'Male',
        accommodation: accommodation || 'Day Scholar',
        hostel: hostel || '',
        roomNumber: roomNumber || ''
      }];
    }

    if (memberList.length === 0) {
      return res.status(400).json({ message: 'At least one member with Name and Reg No is required' });
    }

    const teamId = await generateNextTeamId();
    const finalTeamName = (teamName && teamName.trim()) 
      ? teamName.trim().toUpperCase() 
      : `${(memberList[0].name || 'ALPHA').trim().toUpperCase()}'S TEAM`;

    const leadRegNo = (memberList[0].regNo || '').trim().toUpperCase();
    const leadEmail = (memberList[0].email || `${leadRegNo.toLowerCase()}@klu.ac.in`).trim().toLowerCase();

    // Create student documents
    const createdStudentIds = [];
    for (let i = 0; i < memberList.length; i++) {
      const m = memberList[i];
      const mReg = (m.regNo || '').trim().toUpperCase();
      const mEmail = (m.email || (mReg ? `${mReg.toLowerCase()}@klu.ac.in` : '')).trim().toLowerCase();
      
      const student = await Student.create({
        name: (m.name || `Member ${i + 1}`).trim().toUpperCase(),
        regNo: mReg,
        department: m.department || 'CSE',
        year: m.year || 'III',
        section: (m.section || 'A').trim().toUpperCase(),
        mobile: (m.mobile || '9999999999').trim(),
        email: mEmail,
        gender: m.gender || 'Male',
        accommodation: m.accommodation || 'Day Scholar',
        hostel: m.accommodation === 'Hosteller' ? (m.hostel || '') : '',
        roomNumber: m.accommodation === 'Hosteller' ? (m.roomNumber || '') : ''
      });
      createdStudentIds.push(student._id);
    }

    const finalStatus = status || 'VERIFIED';
    const finalAmount = amount !== undefined ? Number(amount) : (memberList.length * 350);
    const finalUtr = utr ? utr.trim() : `DIR${Date.now().toString().slice(-8)}`;

    const team = await Team.create({
      teamId,
      teamName: finalTeamName,
      track: track || 'DRAGON INTELLIGENCE (AI & ML)',
      leadEmail,
      leadRegNo,
      members: createdStudentIds,
      payment: {
        amount: finalAmount,
        utr: finalUtr,
        screenshotUrl: screenshotUrl || '/assets/payment_qr.png',
        status: finalStatus,
        verifiedAt: finalStatus === 'VERIFIED' ? new Date() : null
      }
    });

    // Link teamId to students
    await Student.updateMany(
      { _id: { $in: createdStudentIds } },
      { $set: { teamId: team._id } }
    );

    res.status(201).json({
      success: true,
      message: `Direct Team Registration ${teamId} created successfully!`,
      teamId,
      team
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
    if (req.body.screenshotUrl) team.payment.screenshotUrl = req.body.screenshotUrl;
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

// Prune all orphaned/stale deleted records and sync user teamIds without touching present registrations
export const cleanOrphanData = async (req, res) => {
  try {
    const { cleanOrphanedDeletedData } = await import('../utils/dataCleanup.js');
    const result = await cleanOrphanedDeletedData();
    res.json({
      success: true,
      message: 'Orphaned data scan & cleanup completed successfully. Present registrations preserved.',
      result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

