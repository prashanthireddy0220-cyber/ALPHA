import express from 'express';
import {
  createSession,
  getSessions,
  updateSessionStatus,
  updateSession,
  deleteSession
} from '../controllers/attendanceSessionController.js';
import { protect, adminOnly, volunteerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Volunteers & Admins can read sessions
router.get('/', protect, volunteerOnly, getSessions);

// Admin-only routes
router.post('/', protect, adminOnly, createSession);
router.put('/:id/status', protect, adminOnly, updateSessionStatus);
router.put('/:id', protect, adminOnly, updateSession);
router.delete('/:id', protect, adminOnly, deleteSession);

export default router;
