import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, uppercase: true },
  regNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
  department: { type: String, required: true, default: 'CSE' },
  year: { type: String, required: true, default: 'III' },
  section: { type: String, required: true, trim: true, uppercase: true, default: 'A' },
  mobile: { type: String, required: true, trim: true, default: '9999999999' },
  gender: { type: String, required: true, default: 'Male' },
  accommodation: { type: String, required: true, default: 'Day Scholar' },
  hostel: { type: String, default: 'N/A' },
  roomNumber: { type: String, default: 'N/A' },
  email: { type: String, required: true, lowercase: true, trim: true }
}, { timestamps: true });

// Index for email uniqueness checks
studentSchema.index({ email: 1 });

export default mongoose.model('Student', studentSchema);
