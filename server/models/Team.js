import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true, uppercase: true },
  teamName: { type: String, required: true, trim: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  leadRegNo: { type: String, required: true },
  leadEmail: { type: String, required: true },
  payment: {
    utr: { type: String, required: true, unique: true, length: 12 },
    screenshotUrl: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
    rejectionReason: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date }
  },
  track: { type: String, default: 'General Innovation' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
