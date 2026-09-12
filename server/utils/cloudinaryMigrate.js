import Team from '../models/Team.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Auto-migration utility:
 * Scans MongoDB Team records for any legacy base64 image strings or missing public_ids.
 * Uploads base64 strings to Cloudinary and replaces them with permanent Cloudinary secure_urls.
 */
export const migrateImagesToCloudinary = async () => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'ALPHA';
    const apiKey = process.env.CLOUDINARY_API_KEY || '114482793422878';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'ctvDTuUrMb42pg2D3BHTPwNBmfM';

    if (!cloudName || !apiKey || !apiSecret) {
      return;
    }

    const teamsWithBase64 = await Team.find({
      'payment.screenshotUrl': { $regex: /^data:image\// }
    });

    if (teamsWithBase64.length === 0) {
      return;
    }

    console.log(`[Cloudinary Migration] Found ${teamsWithBase64.length} teams with base64 images. Uploading to Cloudinary...`);

    for (const team of teamsWithBase64) {
      try {
        const base64Str = team.payment.screenshotUrl;
        const result = await cloudinary.uploader.upload(base64Str, {
          folder: 'alpha_payment_screenshots',
          resource_type: 'image'
        });

        if (result && result.secure_url) {
          team.payment.screenshotUrl = result.secure_url;
          team.payment.public_id = result.public_id || '';
          team.payment.asset_id = result.asset_id || '';
          await team.save();
          console.log(`[Cloudinary Migration] Successfully migrated team ${team.teamId} (${team.teamName}) to Cloudinary.`);
        }
      } catch (err) {
        console.warn(`[Cloudinary Migration Error] Could not upload image for team ${team.teamId}:`, err.message);
      }
    }
  } catch (error) {
    console.warn('[Cloudinary Migration Error]', error.message);
  }
};
