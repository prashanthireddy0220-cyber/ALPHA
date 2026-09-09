import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  regNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
  department: { type: String, required: true, enum: ['CSE', 'ECE', 'IT', 'EEE', 'MECH', 'CIVIL', 'BIO', 'OTHERS'] },
  year: { type: String, required: true, enum: ['II', 'III', 'IV'] },
  section: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  gender: { type: String, required: true, enum: ['Male', 'Female'] },
  accommodation: { type: String, required: true, enum: ['Day Scholar', 'Hosteller'] },
  hostel: { type: String, enum: ['MH-1', 'MH-2', 'MH-3', 'MH-4', 'MH-5', 'MH-6', 'MH-7', 'LH-1', 'LH-2', 'LH-3', 'LH-4', 'N/A'], default: 'N/A' },
  roomNumber: { type: String, default: 'N/A' },
  email: { type: String, required: true, lowercase: true }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
