import Team from '../models/Team.js';

export const generateNextTeamId = async () => {
  // Retrieve all existing teams to find the maximum numeric ID currently in use
  const allTeams = await Team.find({}, { teamId: 1 }).exec();

  let maxNum = 0;

  for (const team of allTeams) {
    if (!team.teamId) continue;
    // Extract any sequence of digits from formats like "ALPHAA 001", "ALPHA-001", "ALPHAA-001", "ALPHA 001"
    const match = team.teamId.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(3, '0');
  return `ALPHA-${padded}`;
};
