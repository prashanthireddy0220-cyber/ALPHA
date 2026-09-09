import Team from '../models/Team.js';
import Student from '../models/Student.js';
import RegistrationReservation from '../models/RegistrationReservation.js';
import EventSettings from '../models/EventSettings.js';
import PaymentAudit from '../models/PaymentAudit.js';

export const getAdminStats = async (req, res) => {
  try {
    const settings = (await EventSettings.findOne()) || { maxTeams: 100 };
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
      rejectedPayments
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
