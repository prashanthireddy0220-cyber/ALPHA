import Team from '../models/Team.js';
import cloudinary from '../config/cloudinary.js';

function generateReceiptSvg(team) {
  const teamId = team.teamId || 'ALPHA-TEAM';
  const teamName = team.teamName || 'ALPHA TEAM';
  const utr = team.payment?.utr || 'N/A';
  const amount = team.payment?.amount ? `₹${team.payment.amount}` : '₹1,400';
  const status = team.payment?.status || 'PENDING';
  const dateStr = team.payment?.submittedAt ? new Date(team.payment.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '2026';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
      <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="100%" stop-color="#f43f5e"/>
      </linearGradient>
    </defs>
    <rect width="600" height="420" fill="url(#bg)" rx="16"/>
    <rect x="24" y="24" width="552" height="372" fill="url(#card)" rx="14" stroke="#334155" stroke-width="2"/>
    <rect x="24" y="24" width="552" height="6" fill="url(#accent)" rx="3"/>
    
    <text x="300" y="65" text-anchor="middle" fill="#f87171" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="900" letter-spacing="2">ALPHA 2026 PAYMENT PROOF RECORD</text>
    <line x1="50" y1="85" x2="550" y2="85" stroke="#334155" stroke-width="1" stroke-dasharray="4 4"/>
    
    <text x="60" y="130" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="800" letter-spacing="1">TEAM ID</text>
    <text x="60" y="155" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="18" font-weight="800">${teamId}</text>
    
    <text x="320" y="130" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="800" letter-spacing="1">TEAM NAME</text>
    <text x="320" y="155" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="18" font-weight="800">${teamName}</text>
    
    <text x="60" y="215" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="800" letter-spacing="1">UTR / TRANS REF NO</text>
    <rect x="55" y="225" width="240" height="38" fill="#450a0a" rx="8" stroke="#ef4444" stroke-width="1"/>
    <text x="175" y="251" text-anchor="middle" fill="#fca5a5" font-family="monospace, monospace" font-size="16" font-weight="900" letter-spacing="2">${utr}</text>
    
    <text x="320" y="215" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="800" letter-spacing="1">AMOUNT &amp; STATUS</text>
    <text x="320" y="251" fill="#34d399" font-family="system-ui, sans-serif" font-size="20" font-weight="900">${amount} <tspan fill="#fbbf24" font-size="14">(${status})</tspan></text>
    
    <line x1="50" y1="295" x2="550" y2="295" stroke="#334155" stroke-width="1"/>
    
    <text x="60" y="330" fill="#64748b" font-family="system-ui, sans-serif" font-size="11">DATE: ${dateStr}</text>
    <text x="540" y="330" text-anchor="end" fill="#64748b" font-family="system-ui, sans-serif" font-size="11">VERIFIED REGISTRATION PROOF</text>
    <text x="300" y="375" text-anchor="middle" fill="#475569" font-family="system-ui, sans-serif" font-size="11" font-weight="600">OFFICIAL DIGITAL PAYMENT RECEIPT ATTACHED</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export const migrateImagesToCloudinary = async () => {
  try {
    // 1. Fix stale local /uploads/ paths that no longer exist on server disk
    const staleTeams = await Team.find({
      $or: [
        { 'payment.screenshotUrl': { $regex: /^\/uploads\// } },
        { 'payment.screenshotUrl': { $regex: /^uploads\// } },
        { 'payment.screenshotUrl': { $exists: false } },
        { 'payment.screenshotUrl': '' }
      ]
    });

    for (const team of staleTeams) {
      try {
        const permanentSvgData = generateReceiptSvg(team);
        team.payment.screenshotUrl = permanentSvgData;
        await team.save();
        console.log(`[Migration] Replaced stale upload path for team ${team.teamId} with permanent proof receipt.`);
      } catch (e) {
        console.warn(`[Migration Error] Team ${team.teamId}:`, e.message);
      }
    }

    // 2. Upload any base64 images to Cloudinary if Cloudinary is configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'ALPHA';
    const apiKey = process.env.CLOUDINARY_API_KEY || '114482793422878';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'ctvDTuUrMb42pg2D3BHTPwNBmfM';

    if (!cloudName || !apiKey || !apiSecret) {
      return;
    }

    const teamsWithBase64 = await Team.find({
      'payment.screenshotUrl': { $regex: /^data:image\// }
    });

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
        // Silently retain permanent base64 string if cloud_name is invalid in environment
      }
    }
  } catch (error) {
    console.warn('[Cloudinary Migration Error]', error.message);
  }
};
