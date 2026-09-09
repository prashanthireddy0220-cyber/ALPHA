import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true, uppercase: true },
  teamName: { type: String, required: true, trim: true, uppercase: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  leadRegNo: { type: String, required: true, uppercase: true, trim: true },
  leadEmail: { type: String, required: true, lowercase: true, trim: true },
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

// Case-insensitive index on teamName for safety
teamSchema.index({ teamName: 1 }, { collation: { locale: 'en', strength: 2 } });

export default mongoose.model('Team', teamSchema);
