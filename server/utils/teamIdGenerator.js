import Team from '../models/Team.js';

export const generateNextTeamId = async () => {
  // Find highest existing team ID
  const latestTeam = await Team.findOne({ teamId: /^ALPHA-\d+$/ })
    .sort({ teamId: -1 })
    .exec();

  if (!latestTeam) {
    return 'ALPHA-001';
  }

  const matches = latestTeam.teamId.match(/ALPHA-(\d+)/);
  if (!matches || !matches[1]) {
    return 'ALPHA-001';
  }

  const nextNum = parseInt(matches[1], 10) + 1;
  const padded = String(nextNum).padStart(3, '0');
  return `ALPHA-${padded}`;
};
