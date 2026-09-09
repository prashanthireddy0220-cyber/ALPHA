import express from 'express';
import {
  validateDetails,
  reservePaymentSlot,
  getReservationStatus,
  submitRegistration,
  verifyTeamPass,
  getMyTeam
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/validate-details', validateDetails);
router.post('/reserve-payment-slot', reservePaymentSlot);
router.get('/reservation-status/:reservationId', getReservationStatus);
router.post('/submit', submitRegistration);
router.get('/verify/:teamId', verifyTeamPass);
router.get('/my-team', protect, getMyTeam);

// Legacy fallback endpoint for slot reservation
router.post('/reserve', reservePaymentSlot);

// Upload screenshot endpoint
router.post('/upload-screenshot', upload.single('screenshot'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename
  });
});

export default router;
