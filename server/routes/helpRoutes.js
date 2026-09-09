import express from 'express';
import { createHelpRequest, getHelpRequests, updateHelpStatus } from '../controllers/helpController.js';
import { protect, volunteerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', protect, createHelpRequest);
router.get('/list', protect, volunteerOnly, getHelpRequests);
router.put('/:id/status', protect, volunteerOnly, updateHelpStatus);

export default router;
