import AttendanceSession from '../models/AttendanceSession.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import AuditLog from '../models/AuditLog.js';

// Create attendance session (Initial status = CLOSED)
export const createSession = async (req, res) => {
  try {
    const { name, date, startTime, endTime, description, expectedParticipants, assignedVolunteers } = req.body;
    if (!name || !date) {
      return res.status(400).json({ message: 'Session name and date are required' });
    }

    const session = await AttendanceSession.create({
      name,
      date,
      startTime: startTime || '09:00 AM',
      endTime: endTime || '12:00 PM',
      description: description || '',
      expectedParticipants: expectedParticipants || 250,
      assignedVolunteers: assignedVolunteers || [],
      status: 'CLOSED',
      createdBy: req.user?.name || 'Admin'
    });

    await AuditLog.create({
      action: 'CREATE_SESSION',
      performedBy: req.user?.name || 'Admin',
      details: `Created attendance session "${name}" (${date}) initially CLOSED.`
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance sessions (Auto-ensures an OPEN session exists for live scanning)
export const getSessions = async (req, res) => {
  try {
    let sessions = await AttendanceSession.find()
      .populate('assignedVolunteers', 'name volunteerId email status attendancePermission')
      .sort({ createdAt: -1 });

    let hasOpen = sessions.some(s => s.status === 'OPEN');
    if (!hasOpen) {
      if (sessions.length > 0) {
        // Auto-open latest session
        sessions[0].status = 'OPEN';
        sessions[0].openedAt = new Date();
        await sessions[0].save();
      } else {
        // Create initial OPEN session
        const defaultSession = await AttendanceSession.create({
          name: 'ALPHA 2026 Live Main Check-in',
          date: 'OCTOBER 1, 2026',
          startTime: '08:00 AM',
          endTime: '08:00 PM',
          description: 'Official main entrance live QR scanning session',
          expectedParticipants: 300,
          status: 'OPEN',
          openedAt: new Date()
        });
        sessions = [defaultSession];
      }
    }

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update session status (OPEN / CLOSE)
export const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'OPEN' or 'CLOSED'

    if (!['OPEN', 'CLOSED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Must be OPEN or CLOSED.' });
    }

    const session = await AttendanceSession.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found' });
    }

    session.status = status;
    if (status === 'OPEN') {
      session.openedAt = new Date();
    } else {
      session.closedAt = new Date();
    }
    await session.save();

    await AuditLog.create({
      action: status === 'OPEN' ? 'OPEN_SESSION' : 'CLOSE_SESSION',
      performedBy: req.user?.name || 'Admin',
      details: `${status === 'OPEN' ? 'Opened' : 'Closed'} attendance session "${session.name}".`
    });

    res.json({
      message: `Attendance session is now ${status}`,
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update session details
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await AttendanceSession.findByIdAndUpdate(id, req.body, { new: true });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete session
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await AttendanceSession.findByIdAndDelete(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Also clean up associated attendance records
    await AttendanceRecord.deleteMany({ sessionId: id });

    await AuditLog.create({
      action: 'DELETE_SESSION',
      performedBy: req.user?.name || 'Admin',
      details: `Deleted session "${session.name}".`
    });

    res.json({ message: 'Attendance session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
