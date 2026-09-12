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
  let tempFilePath = req.file ? req.file.path : null;
  try {
    const uploadSource = tempFilePath || req.body.base64;

    if (!uploadSource) {
      return res.status(400).json({ message: 'No file or base64 image provided' });
    }

    // 1. Attempt Cloudinary upload
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'ALPHA';
      const apiKey = process.env.CLOUDINARY_API_KEY || '114482793422878';
      const apiSecret = process.env.CLOUDINARY_API_SECRET || 'ctvDTuUrMb42pg2D3BHTPwNBmfM';

      if (cloudName && apiKey && apiSecret) {
        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

        const result = await cloudinary.uploader.upload(uploadSource, {
          folder: 'alpha_payment_screenshots',
          resource_type: 'image'
        });

        if (result && result.secure_url) {
          return res.json({
            success: true,
            url: result.secure_url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            asset_id: result.asset_id
          });
        }
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload error, falling back to permanent base64 storage:', cloudErr.message);
    }

    // 2. Fallback to base64 Data URL so it is stored permanently in MongoDB Atlas (never temporary local disk)
    let base64Url = req.body.base64;
    if (!base64Url && tempFilePath && fs.existsSync(tempFilePath)) {
      const fileBuffer = fs.readFileSync(tempFilePath);
      const mimeType = req.file.mimetype || 'image/png';
      base64Url = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }

    if (base64Url) {
      return res.json({
        success: true,
        url: base64Url,
        public_id: '',
        asset_id: ''
      });
    }

    return res.status(500).json({ message: 'Failed to process screenshot' });
  } catch (error) {
    console.error('Screenshot upload processing failed:', error);
    res.status(500).json({ message: 'Failed to process screenshot' });
  } finally {
    // Synchronously clean up temporary multer file on disk so local server disk is never depended upon
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.warn('Could not remove temporary upload file:', e.message);
      }
    }
  }
});

export default router;

