import Team from '../models/Team.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import RegistrationReservation from '../models/RegistrationReservation.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import Attendance from '../models/Attendance.js';
import HelpRequest from '../models/HelpRequest.js';

export const cleanOrphanedDeletedData = async () => {
  try {
    console.log('[Cleanup] Starting database integrity scan and orphan cleanup...');

    // 1. Fetch all ACTIVE teams currently in the database
    const activeTeams = await Team.find().populate('members').lean().exec();
    console.log(`[Cleanup] Found ${activeTeams.length} active registered teams.`);

    const activeTeamIds = new Set();
    const activeStudentIdSet = new Set();
    const activeEmailToTeamId = new Map();
    const activeRegNoToTeamId = new Map();

    for (const team of activeTeams) {
      if (team.teamId) {
        activeTeamIds.add(team.teamId.toUpperCase());
        activeTeamIds.add(team.teamId.replace(/-/g, ' ').toUpperCase());
        activeTeamIds.add(team.teamId.replace(/\s+/g, '-').toUpperCase());
      }

      if (team.leadEmail) {
        const cleanEmail = team.leadEmail.trim().toLowerCase();
        activeEmailToTeamId.set(cleanEmail, team.teamId);
      }
      if (team.leadRegNo) {
        const cleanReg = team.leadRegNo.trim().toUpperCase();
        activeRegNoToTeamId.set(cleanReg, team.teamId);
      }

      if (Array.isArray(team.members)) {
        for (const m of team.members) {
          if (m && m._id) {
            activeStudentIdSet.add(m._id.toString());
          }
          if (m && m.email) {
            activeEmailToTeamId.set(m.email.trim().toLowerCase(), team.teamId);
          }
          if (m && m.regNo) {
            activeRegNoToTeamId.set(m.regNo.trim().toUpperCase(), team.teamId);
          }
        }
      }
    }

    // 2. Remove orphaned Student documents (Students whose ID or email/regNo is not part of any active team)
    const allStudents = await Student.find().lean().exec();
    const orphanedStudentIds = [];
    for (const s of allStudents) {
      const sIdStr = s._id.toString();
      const sEmail = (s.email || '').trim().toLowerCase();
      const sReg = (s.regNo || '').trim().toUpperCase();

      const isInActiveTeam = activeStudentIdSet.has(sIdStr) ||
        (sEmail && activeEmailToTeamId.has(sEmail)) ||
        (sReg && activeRegNoToTeamId.has(sReg));

      if (!isInActiveTeam) {
        orphanedStudentIds.push(s._id);
      }
    }

    if (orphanedStudentIds.length > 0) {
      const delResult = await Student.deleteMany({ _id: { $in: orphanedStudentIds } });
      console.log(`[Cleanup] Removed ${delResult.deletedCount} orphaned student documents.`);
    }

    // 3. Remove expired reservations
    const resResult = await RegistrationReservation.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        ...(activeTeams.length > 0 ? [{ teamName: { $in: activeTeams.map(t => new RegExp(`^${t.teamName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i')) } }] : [])
      ]
    });
    if (resResult.deletedCount > 0) {
      console.log(`[Cleanup] Removed ${resResult.deletedCount} expired/stale reservation slots.`);
    }

    // 4. Clean up User collection: Fix or unset teamId
    const allUsers = await User.find({ role: 'user' }).exec();
    let usersCleaned = 0;
    for (const u of allUsers) {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uReg = uEmail ? uEmail.split('@')[0].toUpperCase() : '';

      const matchingTeamId = activeEmailToTeamId.get(uEmail) || (uReg ? activeRegNoToTeamId.get(uReg) : null);

      if (matchingTeamId) {
        if (u.teamId !== matchingTeamId) {
          u.teamId = matchingTeamId;
          await u.save();
          usersCleaned++;
        }
      } else {
        if (u.teamId) {
          u.teamId = undefined;
          await u.save();
          usersCleaned++;
        }
      }
    }

    console.log(`[Cleanup] Verified user accounts (${usersCleaned} synced/unlinked from deleted data).`);
    console.log('[Cleanup] Scan complete. All present registrations are intact.');
    return { success: true, activeTeams: activeTeams.length, orphanedStudentsRemoved: orphanedStudentIds.length, usersCleaned };
  } catch (err) {
    console.error('[Cleanup Error]', err.message);
    return { success: false, error: err.message };
  }
};
