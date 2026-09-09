import mongoose from 'mongoose';

const registrationReservationSchema = new mongoose.Schema({
  reservationId: { type: String, required: true, unique: true },
  teamName: { type: String, required: true },
  leadRegNo: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto deletes after 10 mins (600 seconds)
});

export default mongoose.model('RegistrationReservation', registrationReservationSchema);
