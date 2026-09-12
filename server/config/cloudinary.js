import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || 'ALPHA').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '114482793422878').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || 'ctvDTuUrMb42pg2D3BHTPwNBmfM').trim()
});

export default cloudinary;
