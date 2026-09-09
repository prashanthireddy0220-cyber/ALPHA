import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
  priority: { type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal' },
  author: { type: String, default: 'ALPHA Organizing Team' }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
