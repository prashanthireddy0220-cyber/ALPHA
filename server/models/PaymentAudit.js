import mongoose from 'mongoose';

const paymentAuditSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  adminEmail: { type: String, required: true },
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  reason: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('PaymentAudit', paymentAuditSchema);
