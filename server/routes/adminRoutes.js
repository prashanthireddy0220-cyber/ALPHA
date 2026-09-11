import express from 'express';
import {
  getAdminStats,
  getAdminAnalytics,
  getAdminTeams,
  updatePaymentStatus,
  verifyAllPayments,
  deleteAllRegistrations,
  deleteSingleRegistration,
  directRegistration,
  updateTeamDetails,
  cleanOrphanData
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/analytics', getAdminAnalytics);
router.get('/teams', getAdminTeams);
router.put('/teams/verify-all', verifyAllPayments);
router.delete('/teams/delete-all', deleteAllRegistrations);
router.delete('/teams/:id', deleteSingleRegistration);
router.post('/teams/direct-registration', directRegistration);
router.put('/teams/:id/payment', updatePaymentStatus);
router.put('/teams/:id/edit', updateTeamDetails);
router.post('/clean-orphans', cleanOrphanData);

export default router;
