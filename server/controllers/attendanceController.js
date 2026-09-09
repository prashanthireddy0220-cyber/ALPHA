import AttendanceRecord from '../models/AttendanceRecord.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Team from '../models/Team.js';
import Student from '../models/Student.js';
import AuditLog from '../models/AuditLog.js';

// Scan & Record Participant Attendance (Strict Backend Enforcement)
export const scanAttendance = async (req, res) => {
  try {
    const { teamId, regNo, sessionId } = req.body;
    const volunteerUser = req.user;

    // 1. Verify volunteer role & permission
    if (!volunteerUser || (volunteerUser.role !== 'volunteer' && volunteerUser.role !== 'admin')) {
      return res.status(403).json({ message: 'Forbidden: Attendance permission required' });
    }

    if (volunteerUser.role === 'volunteer') {
      if (volunteerUser.status === 'disabled' || volunteerUser.attendancePermission === false) {
        return res.status(403).json({ message: 'UNAUTHORIZED VOLUNTEER: Your attendance permission has been disabled by Administrator.' });
      }
    }

    // 2. Identify target active session
    let session = null;
    if (sessionId) {
      session = await AttendanceSession.findById(sessionId);
    } else {
      // Find currently OPEN session
      session = await AttendanceSession.findOne({ status: 'OPEN' });
    }

    if (!session) {
      return res.status(400).json({ message: 'NO ACTIVE SESSION: There is currently no active attendance session.' });
    }

    // 3. STRICT BACKEND CHECK: Verify session status is OPEN
    if (session.status !== 'OPEN') {
      return res.status(400).json({ message: 'Attendance session is closed by administrator.' });
    }

    // 4. Verify volunteer session assignment (if restricted)
    if (volunteerUser.role === 'volunteer' && volunteerUser.assignedSessions && volunteerUser.assignedSessions.length > 0) {
      const isAssigned = volunteerUser.assignedSessions.some(sId => sId.toString() === session._id.toString());
      if (!isAssigned) {
        return res.status(403).json({ message: 'UNAUTHORIZED VOLUNTEER: You are not authorized to take attendance for this session.' });
      }
    }

    // 5. Verify participant & team
    if (!teamId && !regNo) {
      return res.status(400).json({ message: 'Team ID or Registration Number is required' });
    }

    let team = null;
    let targetStudent = null;

    const cleanTeamId = teamId ? teamId.trim().toUpperCase() : '';
    const cleanRegNo = regNo ? regNo.trim().toUpperCase() : '';

    if (cleanTeamId) {
      team = await Team.findOne({ teamId: cleanTeamId }).populate('members');
      if (team && team.members && team.members.length > 0) {
        if (cleanRegNo) {
          targetStudent = team.members.find(m => m.regNo?.toUpperCase() === cleanRegNo);
        }
        if (!targetStudent) {
          targetStudent = team.members[0];
        }
      }
    }

    if (!targetStudent && cleanRegNo) {
      targetStudent = await Student.findOne({ regNo: cleanRegNo });
      if (targetStudent) {
        team = await Team.findOne({ members: targetStudent._id }).populate('members');
      }
    }

    if (!targetStudent && !team) {
      return res.status(404).json({ message: 'Invalid QR code or Reg No. Participant not found.' });
    }

    // Fallback if targetStudent exists without explicit team
    if (targetStudent && !team) {
      team = { teamId: 'ALPHA-IND', teamName: targetStudent.name, members: [targetStudent] };
    }

    // 6. Check duplicate attendance for THIS session
    const existingRecord = await AttendanceRecord.findOne({
      sessionId: session._id,
      regNo: targetStudent.regNo.toUpperCase()
    });

    if (existingRecord) {
      return res.status(400).json({
        alreadyMarked: true,
        message: `ALREADY MARKED PRESENT for ${session.name}!`,
        studentName: targetStudent.name,
        regNo: targetStudent.regNo,
        sessionName: session.name,
        teamId: team.teamId,
        scannedAt: existingRecord.scannedAt,
        scannedBy: existingRecord.scannedByVolunteerName
      });
    }

    // 7. Record Attendance
    const record = await AttendanceRecord.create({
      sessionId: session._id,
      sessionName: session.name,
      teamId: team.teamId,
      regNo: targetStudent.regNo.toUpperCase(),
      studentName: targetStudent.name,
      department: targetStudent.department || 'CSE',
      year: targetStudent.year || '3rd Year',
      scannedByVolunteerId: volunteerUser._id,
      scannedByVolunteerName: volunteerUser.name || 'Volunteer',
      scannedAt: new Date()
    });

    // Increment present count on session
    session.presentCount = (session.presentCount || 0) + 1;
    await session.save();

    res.status(200).json({
      success: true,
      message: `ATTENDANCE MARKED PRESENT ✓`,
      studentName: targetStudent.name,
      regNo: targetStudent.regNo,
      department: targetStudent.department || 'CSE',
      year: targetStudent.year || '3rd Year',
      sessionName: session.name,
      teamId: team.teamId,
      teamName: team.teamName,
      scannedAt: record.scannedAt,
      teamMembers: team.members?.map(m => ({ name: m.name, regNo: m.regNo }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Attendance Records for Active or Specific Session
export const getAttendanceLogs = async (req, res) => {
  try {
    const { sessionId } = req.query;
    let filter = {};
    if (sessionId) {
      filter.sessionId = sessionId;
    }

    const logs = await AttendanceRecord.find(filter).sort({ scannedAt: -1 }).exec();
    const totalPresent = logs.length;
    res.json({
      totalPresent,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete/Correct Attendance Record
export const deleteAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await AttendanceRecord.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Decrement present count on session
    await AttendanceSession.findByIdAndUpdate(record.sessionId, { $inc: { presentCount: -1 } });

    await AuditLog.create({
      action: 'DELETE_ATTENDANCE_RECORD',
      performedBy: req.user?.name || 'Admin',
      details: `Deleted attendance for ${record.studentName} (${record.regNo}) in session "${record.sessionName}".`
    });

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
