import express from 'express';
import {
  createVolunteer,
  getVolunteers,
  updateVolunteer,
  resetVolunteerPassword,
  deleteVolunteer
} from '../controllers/volunteerController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.post('/', createVolunteer);
router.get('/', getVolunteers);
router.put('/:id', updateVolunteer);
router.put('/:id/reset-password', resetVolunteerPassword);
router.delete('/:id', deleteVolunteer);

export default router;
