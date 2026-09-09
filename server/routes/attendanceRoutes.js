import express from 'express';
import { scanAttendance, getAttendanceLogs, deleteAttendanceRecord } from '../controllers/attendanceController.js';
import { protect, volunteerOnly, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/scan', volunteerOnly, scanAttendance);
router.get('/logs', volunteerOnly, getAttendanceLogs);
router.delete('/records/:id', adminOnly, deleteAttendanceRecord);

export default router;
