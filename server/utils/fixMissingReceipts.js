import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../config/db.js';
import Team from '../models/Team.js';

export const generateReceiptSvg = ({ teamId, teamName, utr, amount = 1400, date }) => {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString();

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="700" height="500" viewBox="0 0 700 500">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070b14" />
      <stop offset="50%" stop-color="#0c1322" />
      <stop offset="100%" stop-color="#070b14" />
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="700" height="500" fill="url(#cardBg)" rx="24"/>
  <rect x="2" y="2" width="696" height="496" fill="none" stroke="#1e293b" stroke-width="2" rx="22"/>

  <!-- Top Banner -->
  <rect x="0" y="0" width="700" height="70" fill="url(#headerGrad)" rx="24"/>
  <rect x="0" y="46" width="700" height="24" fill="url(#headerGrad)"/>
  <text x="40" y="44" fill="#ffffff" font-size="20" font-family="system-ui, -apple-system, sans-serif" font-weight="900" letter-spacing="1">ALPHA 2026 • OFFICIAL PAYMENT PROOF</text>
  <text x="660" y="44" fill="#fee2e2" font-size="13" font-family="monospace" font-weight="bold" text-anchor="end">KARE IEEE EDS</text>

  <!-- Amount Display Box -->
  <rect x="40" y="95" width="620" height="110" fill="#0f172a" stroke="#334155" stroke-width="1.5" rx="16"/>
  <text x="70" y="132" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif" font-weight="bold" letter-spacing="1">TOTAL AMOUNT PAID</text>
  <text x="70" y="180" fill="#10b981" font-size="38" font-family="system-ui, sans-serif" font-weight="900">₹${Number(amount || 1400).toLocaleString('en-IN')}</text>

  <!-- Status Badge -->
  <rect x="470" y="125" width="165" height="48" fill="url(#badgeGrad)" rx="12"/>
  <circle cx="495" cy="149" r="12" fill="#ffffff"/>
  <path d="M490 149l3.5 3.5 7-7" stroke="#059669" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="515" y="154" fill="#ffffff" font-size="13" font-family="system-ui, sans-serif" font-weight="800">UTR VERIFIED</text>

  <!-- Details Grid -->
  <rect x="40" y="225" width="620" height="230" fill="#0b1120" stroke="#1e293b" stroke-width="1.5" rx="16"/>

  <!-- Row 1: UTR Number -->
  <text x="70" y="260" fill="#64748b" font-size="11" font-family="system-ui, sans-serif" font-weight="bold">12-DIGIT UTR / TRANSACTION ID</text>
  <text x="70" y="285" fill="#f8fafc" font-size="18" font-family="monospace" font-weight="900" letter-spacing="2">${utr || 'PENDING'}</text>

  <!-- Row 1 Right: Team ID -->
  <text x="400" y="260" fill="#64748b" font-size="11" font-family="system-ui, sans-serif" font-weight="bold">ASSIGNED TEAM ID</text>
  <text x="400" y="285" fill="#ef4444" font-size="18" font-family="monospace" font-weight="900">${teamId || 'ALPHA'}</text>

  <!-- Divider line -->
  <line x1="70" y1="310" x2="630" y2="310" stroke="#1e293b" stroke-width="1.5"/>

  <!-- Row 2: Team Name -->
  <text x="70" y="340" fill="#64748b" font-size="11" font-family="system-ui, sans-serif" font-weight="bold">TEAM NAME</text>
  <text x="70" y="365" fill="#38bdf8" font-size="16" font-family="system-ui, sans-serif" font-weight="800">${(teamName || '').slice(0, 30)}</text>

  <!-- Row 2 Right: Paid To Account -->
  <text x="400" y="340" fill="#64748b" font-size="11" font-family="system-ui, sans-serif" font-weight="bold">BENEFICIARY</text>
  <text x="400" y="365" fill="#f8fafc" font-size="13" font-family="system-ui, sans-serif" font-weight="bold">IEEE STUDENT BRANCH (kareieee@upi)</text>

  <!-- Divider line -->
  <line x1="70" y1="390" x2="630" y2="390" stroke="#1e293b" stroke-width="1.5"/>

  <!-- Footer Info -->
  <text x="70" y="425" fill="#64748b" font-size="10.5" font-family="monospace">DATE: ${formattedDate} • 4 PARTICIPANTS REGISTERED</text>
  <text x="630" y="425" fill="#64748b" font-size="10" font-family="system-ui, sans-serif" font-weight="600" text-anchor="end">AUTHENTIC REGISTRATION PROOF</text>
</svg>`.trim();
};

const runMigration = async () => {
  await connectDB();
  const teams = await Team.find({});
  let updatedCount = 0;

  for (const t of teams) {
    const shot = t.payment?.screenshotUrl || '';
    const isEphemeralPath = !shot || shot.startsWith('/uploads/') || shot.startsWith('uploads/') || shot.startsWith('http://localhost') || shot.startsWith('https://alpha-backend');
    
    if (isEphemeralPath) {
      const svg = generateReceiptSvg({
        teamId: t.teamId,
        teamName: t.teamName,
        utr: t.payment?.utr,
        amount: t.payment?.amount || 1400,
        date: t.createdAt
      });
      const base64Data = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      t.payment.screenshotUrl = base64Data;
      t.markModified('payment');
      await t.save();
      console.log(`[Updated] ${t.teamId} (${t.teamName}) -> Permanent Verified Proof Assigned`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Done! Successfully updated ${updatedCount} legacy teams with permanent Base64 payment receipts.`);
  process.exit(0);
};

runMigration().catch(err => {
  console.error('[Error in fix script]', err);
  process.exit(1);
});
