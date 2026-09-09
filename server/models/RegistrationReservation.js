import mongoose from 'mongoose';

const registrationReservationSchema = new mongoose.Schema({
  reservationId: { type: String, required: true, unique: true },
  teamName: { type: String, required: true, uppercase: true, trim: true },
  leadEmail: { type: String, required: true, lowercase: true, trim: true },
  leadRegNo: { type: String, required: true, uppercase: true, trim: true },
  membersData: { type: Array, default: [] },
  track: { type: String, default: 'General Innovation' },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // TTL index cleanup safety
}, { timestamps: true });

export default mongoose.model('RegistrationReservation', registrationReservationSchema);
