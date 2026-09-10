import mongoose from 'mongoose';

const eventSettingsSchema = new mongoose.Schema({
  registrationOpen: { type: Boolean, default: true },
  maxTeams: { type: Number, default: 100 },
  teamSize: { type: Number, default: 4 },
  participantFee: { type: Number, default: 350 },
  teamFee: { type: Number, default: 1400 },
  upiId: { type: String, default: 'kareieee@upi' },
  bankAccountName: { type: String, default: 'IEEE STUDENT BRANCH' },
  bankAccountNumber: { type: String, default: '335602011000121' },
  bankName: { type: String, default: 'UNION BANK OF INDIA' },
  bankBranch: { type: String, default: 'KRISHNANKOIL, WATRAP' },
  bankIfsc: { type: String, default: 'UBIN0562734' },
  bankMicr: { type: String, default: '626026503' },
  qrImageUrl: { type: String, default: '/assets/payment_qr.png' },
  eventName: { type: String, default: 'ALPHA 2026' },
  eventTagline: { type: String, default: 'RISE. CONQUER. RULE.' },
  eventDate: { type: String, default: '1st–2nd October 2026' },
  eventTime: { type: String, default: '09:00 AM IST' },
  venue: { type: String, default: 'KS KRISHNA AUDITORIUM' },
  hackathonDuration: { type: String, default: '24 HOURS' },
  learningDuration: { type: String, default: '30 HOURS' },
  quizDuration: { type: String, default: '1 HOUR' },
  totalDuration: { type: String, default: '55 HOURS' },
  academicCredits: { type: String, default: '2EE Credits' },
  prizePool: { type: String, default: '₹15,000' },
  prize1st: { type: String, default: '₹7,000' },
  prize2nd: { type: String, default: '₹5,000' },
  prize3rd: { type: String, default: '₹3,000' },
  communityLink: { type: String, default: 'https://chat.whatsapp.com/BST4xC9Kdkc3ccZ30BLWYo' },
  instagramLink: { type: String, default: 'https://www.instagram.com/kare_ieee_eds_official/' },
  linkedinLink: { type: String, default: 'https://www.linkedin.com/in/ieee-education-society-kare-97b490381/' }
}, { timestamps: true });

export default mongoose.model('EventSettings', eventSettingsSchema);
