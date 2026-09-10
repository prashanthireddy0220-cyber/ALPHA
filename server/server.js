import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import helpRoutes from './routes/helpRoutes.js';

import User from './models/User.js';
import EventSettings from './models/EventSettings.js';
import Announcement from './models/Announcement.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean);

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import attendanceSessionRoutes from './routes/attendanceSessionRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance/sessions', attendanceSessionRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/help', helpRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'ALPHA Hackathon Backend API', version: '1.0.0' });
});

// Seed default data
const seedInitialData = async () => {
  try {
    // Admin user seed
    let adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'ALPHA Chief Administrator',
        email: 'admin@alpha.klu.ac.in',
        password: '0220',
        role: 'admin'
      });
      console.log('[Seed] Admin account created: admin@alpha.klu.ac.in (Password: 0220)');
    } else {
      const isMatch = await adminExists.matchPassword('0220');
      if (!isMatch) {
        adminExists.password = '0220';
        await adminExists.save();
        console.log('[Seed] Admin password updated: admin@alpha.klu.ac.in (Password: 0220)');
      }
    }

    // Volunteer user seed (passcode 0509)
    let volunteerExists = await User.findOne({ email: 'volunteer@alpha.klu.ac.in' });
    if (!volunteerExists) {
      await User.create({
        name: 'ALPHA Attendance Volunteer',
        email: 'volunteer@alpha.klu.ac.in',
        password: '0509',
        role: 'volunteer',
        volunteerId: 'VOL-0509',
        attendancePermission: true
      });
      console.log('[Seed] Volunteer account created: volunteer@alpha.klu.ac.in (Password: 0509)');
    } else {
      const isMatch = await volunteerExists.matchPassword('0509');
      if (!isMatch || !volunteerExists.attendancePermission || volunteerExists.status !== 'active') {
        if (!isMatch) volunteerExists.password = '0509';
        volunteerExists.attendancePermission = true;
        volunteerExists.status = 'active';
        await volunteerExists.save();
        console.log('[Seed] Volunteer permissions enabled: volunteer@alpha.klu.ac.in (Password: 0509)');
      }
    }

    // Ensure all existing volunteer accounts have live attendance scanning permission enabled
    await User.updateMany({ role: 'volunteer' }, { $set: { attendancePermission: true, status: 'active' } });

    // Event settings seed
    let settings = await EventSettings.findOne();
    if (!settings) {
      await EventSettings.create({
        registrationOpen: true,
        maxTeams: 100,
        teamSize: 4,
        participantFee: 350,
        teamFee: 1400,
        upiId: 'kareieee@upi',
        bankAccountName: 'IEEE STUDENT BRANCH',
        bankAccountNumber: '335602011000121',
        bankName: 'UNION BANK OF INDIA',
        bankBranch: 'KRISHNANKOIL, WATRAP',
        bankIfsc: 'UBIN0562734',
        bankMicr: '626026503',
        eventName: 'ALPHA 2026',
        eventTagline: 'RISE. CONQUER. RULE.',
        eventDate: 'OCTOBER 1 - 2, 2026',
        venue: 'KARE Auditorium & CSE Tech Arena, KLU Campus',
        hackathonDuration: '24 HOURS',
        learningDuration: '40 HOURS',
        quizDuration: '1 HOUR',
        totalDuration: '65 HOURS',
        academicCredits: '2EE Credits',
        prizePool: '₹1,50,000',
        prize1st: '₹60,000',
        prize2nd: '₹50,000',
        prize3rd: '₹40,000',
        communityLink: 'https://chat.whatsapp.com/KQgGm91cXyS1WiZC8nVyls',
        instagramLink: 'https://www.instagram.com/kare_ieee_eds_official/',
        linkedinLink: 'https://www.linkedin.com/in/ieee-education-society-kare-97b490381/'
      });
      console.log('[Seed] Event settings initialized.');
    } else {
      // Ensure date, bank details & social links are updated
      settings.eventDate = 'OCTOBER 1 - 2, 2026';
      settings.bankAccountName = 'IEEE STUDENT BRANCH';
      settings.bankAccountNumber = '335602011000121';
      settings.bankName = 'UNION BANK OF INDIA';
      settings.bankBranch = 'KRISHNANKOIL, WATRAP';
      settings.bankIfsc = 'UBIN0562734';
      settings.bankMicr = '626026503';
      settings.communityLink = 'https://chat.whatsapp.com/KQgGm91cXyS1WiZC8nVyls';
      settings.instagramLink = 'https://www.instagram.com/kare_ieee_eds_official/';
      settings.linkedinLink = 'https://www.linkedin.com/in/ieee-education-society-kare-97b490381/';
      await settings.save();
    }

    // Initial Announcement seed
    const announcementExists = await Announcement.findOne();
    if (!announcementExists) {
      await Announcement.create({
        title: '⚔ WELCOME TO ALPHA 2026 HACKATHON',
        message: 'Registration verification is currently in progress. Ensure your UTR and screenshot are submitted correctly.',
        status: 'Published',
        priority: 'Important',
        author: 'KARE IEEE Education Society'
      });
      console.log('[Seed] Default announcement created.');
    }
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  try {
    await seedInitialData();
  } catch (err) {
    console.error('[Seed Error]', err);
  }
  app.listen(PORT, () => {
    console.log(`[ALPHA Server] Running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('[Database Connection Error]', err);
});
