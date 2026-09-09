import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  teamId: { type: String, required: true, uppercase: true },
  regNo: { type: String, required: true, uppercase: true },
  studentName: { type: String, required: true },
  checkpoint: {
    type: String,
    enum: ['Check-in', 'Lunch', 'Hackathon Entry', 'Final Submission', 'Exit'],
    default: 'Check-in'
  },
  scannedByVolunteer: { type: String, required: true },
  scannedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index to prevent duplicate scans per student per checkpoint
attendanceSchema.index({ regNo: 1, checkpoint: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
