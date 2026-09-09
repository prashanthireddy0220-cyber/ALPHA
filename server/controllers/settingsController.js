import EventSettings from '../models/EventSettings.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await EventSettings.findOne();
    if (!settings) {
      settings = await EventSettings.create({});
    }
    res.json(settings);
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
