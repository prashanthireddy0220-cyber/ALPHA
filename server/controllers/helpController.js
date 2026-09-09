import HelpRequest from '../models/HelpRequest.js';
import Team from '../models/Team.js';

export const createHelpRequest = async (req, res) => {
  try {
    const { category, message } = req.body;
    let teamId = req.user?.teamId || 'ALPHA-001';
    let teamName = 'Registered Team';

    const team = await Team.findOne({ user: req.user._id });
    if (team) {
      teamId = team.teamId;
      teamName = team.teamName;
    }

    if (!message) {
      return res.status(400).json({ message: 'Help request description message is required' });
    }

    const helpReq = await HelpRequest.create({
      teamId,
      teamName,
      requestedBy: req.user?.name || 'Team Lead',
      category: category || 'Other',
      message: message.trim(),
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: 'Help request submitted! A volunteer will assist you shortly.',
      helpReq
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHelpRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find().sort({ createdAt: -1 }).exec();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHelpStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const volunteerName = req.user?.name || 'Volunteer';

    const helpReq = await HelpRequest.findById(id);
    if (!helpReq) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    helpReq.status = status;
    helpReq.assignedVolunteer = volunteerName;
    if (status === 'RESOLVED') {
      helpReq.resolvedAt = new Date();
    }

    await helpReq.save();

    res.json({
      success: true,
      message: `Help request updated to ${status}`,
      helpReq
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
