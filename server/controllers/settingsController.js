import EventSettings from '../models/EventSettings.js';
import Team from '../models/Team.js';
import RegistrationReservation from '../models/RegistrationReservation.js';

export const getSettings = async (req, res) => {
  try {
    let settingsDoc = await EventSettings.findOne().lean();
    if (!settingsDoc) {
      const created = await EventSettings.create({});
      settingsDoc = created.toObject();
    }

    const totalTeams = await Team.countDocuments();
    const activeReservations = await RegistrationReservation.countDocuments({
      expiresAt: { $gt: new Date() }
    });

    const maxTeams = settingsDoc.maxTeams || 100;
    const availableSlots = Math.max(0, maxTeams - totalTeams - activeReservations);

    res.json({
      ...settingsDoc,
      totalTeams,
      availableSlots,
      activeReservations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await EventSettings.findOne();
    if (!settings) {
      settings = new EventSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({
      success: true,
      message: 'Event settings updated successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
