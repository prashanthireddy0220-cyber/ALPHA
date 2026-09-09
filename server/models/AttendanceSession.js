import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date: { type: String, required: true }, // e.g. "01/10/2026" or "2026-10-01"
  startTime: { type: String, default: '09:00 AM' },
  endTime: { type: String, default: '12:00 PM' },
  description: { type: String, default: '' },
  expectedParticipants: { type: Number, default: 250 },
  status: { type: String, enum: ['CLOSED', 'OPEN'], default: 'CLOSED' },
  assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: String, default: 'Admin' },
  openedAt: { type: Date, default: null },
  closedAt: { type: Date, default: null },
  presentCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('AttendanceSession', attendanceSessionSchema);
