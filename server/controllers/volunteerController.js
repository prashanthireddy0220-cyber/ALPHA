import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// Create volunteer account (Admin only)
export const createVolunteer = async (req, res) => {
  try {
    const { name, volunteerId, email, password, attendancePermission, assignedSessions } = req.body;
    if (!name || !volunteerId || !password) {
      return res.status(400).json({ message: 'Volunteer name, ID, and password are required' });
    }

    const emailValue = email ? email.toLowerCase() : `${volunteerId.toLowerCase()}@alpha.klu.ac.in`;

    const userExists = await User.findOne({
      $or: [{ email: emailValue }, { volunteerId: volunteerId.toUpperCase() }]
    });

    if (userExists) {
      return res.status(400).json({ message: 'Volunteer already exists with this Email or Volunteer ID' });
    }

    const volunteer = await User.create({
      name,
      volunteerId: volunteerId.toUpperCase(),
      email: emailValue,
      password,
      role: 'volunteer',
      attendancePermission: attendancePermission !== false,
      assignedSessions: assignedSessions || [],
      status: 'active'
    });

    await AuditLog.create({
      action: 'CREATE_VOLUNTEER',
      performedBy: req.user?.name || 'Admin',
      details: `Created volunteer "${name}" (${volunteerId}).`
    });

    res.status(201).json({
      _id: volunteer._id,
      name: volunteer.name,
      volunteerId: volunteer.volunteerId,
      email: volunteer.email,
      role: volunteer.role,
      attendancePermission: volunteer.attendancePermission,
      status: volunteer.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all volunteers
export const getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' })
      .populate('assignedSessions', 'name date startTime endTime status')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update volunteer details / permissions / session assignments
export const updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, attendancePermission, status, assignedSessions } = req.body;

    const volunteer = await User.findById(id);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer account not found' });
    }

    if (name !== undefined) volunteer.name = name;
    if (attendancePermission !== undefined) volunteer.attendancePermission = attendancePermission;
    if (status !== undefined) volunteer.status = status;
    if (assignedSessions !== undefined) volunteer.assignedSessions = assignedSessions;

    await volunteer.save();

    await AuditLog.create({
      action: 'UPDATE_VOLUNTEER',
      performedBy: req.user?.name || 'Admin',
      details: `Updated volunteer "${volunteer.name}" (${volunteer.volunteerId}). Permission: ${volunteer.attendancePermission}`
    });

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset volunteer password
export const resetVolunteerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: 'New password must be at least 4 characters long' });
    }

    const volunteer = await User.findById(id);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer account not found' });
    }

    volunteer.password = newPassword;
    await volunteer.save(); // pre-save hashes with bcrypt

    await AuditLog.create({
      action: 'RESET_VOLUNTEER_PASSWORD',
      performedBy: req.user?.name || 'Admin',
      details: `Reset password for volunteer "${volunteer.name}" (${volunteer.volunteerId}).`
    });

    res.json({ message: 'Volunteer password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete volunteer
export const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await User.findByIdAndDelete(id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    await AuditLog.create({
      action: 'DELETE_VOLUNTEER',
      performedBy: req.user?.name || 'Admin',
      details: `Deleted volunteer "${volunteer.name}".`
    });

    res.json({ message: 'Volunteer account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
