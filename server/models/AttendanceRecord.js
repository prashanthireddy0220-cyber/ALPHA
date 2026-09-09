import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  sessionName: { type: String, required: true },
  teamId: { type: String, required: true, uppercase: true },
  regNo: { type: String, required: true, uppercase: true },
  studentName: { type: String, required: true },
  department: { type: String, default: 'CSE' },
  year: { type: String, default: '3rd Year' },
  scannedByVolunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scannedByVolunteerName: { type: String, default: 'Volunteer' },
  scannedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Enforce unique participant attendance per session
attendanceRecordSchema.index({ sessionId: 1, regNo: 1 }, { unique: true });

export default mongoose.model('AttendanceRecord', attendanceRecordSchema);
