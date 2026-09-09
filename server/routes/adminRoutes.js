import express from 'express';
import {
  getAdminStats,
  getAdminTeams,
  updatePaymentStatus,
  verifyAllPayments,
  deleteAllRegistrations,
  deleteSingleRegistration,
  directRegistration
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/teams', getAdminTeams);
router.put('/teams/verify-all', verifyAllPayments);
router.delete('/teams/delete-all', deleteAllRegistrations);
router.delete('/teams/:id', deleteSingleRegistration);
router.post('/teams/direct-registration', directRegistration);
router.put('/teams/:id/payment', updatePaymentStatus);

export default router;
