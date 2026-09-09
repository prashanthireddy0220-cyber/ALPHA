import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  teamName: { type: String, required: true },
  requestedBy: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Technical Issue', 'Food', 'Accommodation', 'Payment', 'Registration', 'Venue', 'Other'],
    default: 'Other'
  },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'], default: 'PENDING' },
  assignedVolunteer: { type: String, default: 'Unassigned' },
  resolvedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('HelpRequest', helpRequestSchema);
