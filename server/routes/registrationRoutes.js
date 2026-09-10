import express from 'express';
import {
  validateDetails,
  reservePaymentSlot,
  getReservationStatus,
  submitRegistration,
  verifyTeamPass,
  getMyTeam,
  getPublicCapacityStats,
  checkTeamName
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/capacity-stats', getPublicCapacityStats);
router.get('/check-team-name', checkTeamName);
router.post('/validate-details', protect, validateDetails);
router.post('/reserve-payment-slot', protect, reservePaymentSlot);
router.get('/reservation-status/:reservationId', getReservationStatus);
router.post('/submit', protect, submitRegistration);
router.get('/verify/:teamId', verifyTeamPass);
router.get('/my-team', protect, getMyTeam);

// Legacy fallback endpoint for slot reservation
router.post('/reserve', protect, reservePaymentSlot);

import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Upload screenshot endpoint (Permanent Cloudinary + Base64 fallback)
router.post('/upload-screenshot', upload.single('screenshot'), async (req, res) => {
  try {
    if (req.body.base64 && req.body.base64.startsWith('data:image/')) {
      return res.json({
        success: true,
        url: req.body.base64
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Try Cloudinary upload
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'alpha_payment_screenshots',
          resource_type: 'image'
        });
        if (result && result.secure_url) {
          return res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
          });
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload error, falling back to base64 buffer:', cloudErr.message);
      }
    }

    // Convert file buffer to base64 Data URL so it is stored permanently in MongoDB Atlas
    const fileBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype || 'image/png';
    const base64Url = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    res.json({
      success: true,
      url: base64Url,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Screenshot upload processing failed:', error);
    res.status(500).json({ message: 'Failed to process screenshot' });
  }
});

export default router;

