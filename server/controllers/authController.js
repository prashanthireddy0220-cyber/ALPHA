import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'alpha_secret_dragon_key_2026_super_secure_jwt', {
    expiresIn: '7d'
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password or passcode is required' });
    }

    const rawIdentifier = (email || '').trim();
    const cleanPassword = password.trim();

    // Support entering pure RegNo (e.g. 2300030001 -> 2300030001@klu.ac.in)
    let identifier = rawIdentifier;
    if (identifier && !identifier.includes('@') && !identifier.toUpperCase().startsWith('VOL') && identifier.toLowerCase() !== 'admin') {
      identifier = `${identifier}@klu.ac.in`;
    }

    let user = null;

    // 1. Direct lookup by Email or Volunteer ID
    if (identifier) {
      user = await User.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { volunteerId: identifier.toUpperCase() }
        ]
      });
    }

    // 2. Validate direct match if user found
    if (user && (await user.matchPassword(cleanPassword))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        volunteerId: user.volunteerId,
        attendancePermission: user.attendancePermission,
        status: user.status,
        assignedSessions: user.assignedSessions,
        token: generateToken(user._id)
      });
    }

    // 3. Fail-safe Admin Login Handler (Passcode '0220' or admin email)
    if (identifier.toLowerCase() === 'admin@alpha.klu.ac.in' || cleanPassword === '0220') {
      const adminUsers = await User.find({ role: 'admin' });
      for (const adminCandidate of adminUsers) {
        if (await adminCandidate.matchPassword(cleanPassword)) {
          return res.json({
            _id: adminCandidate._id,
            name: adminCandidate.name,
            email: adminCandidate.email,
            role: adminCandidate.role,
            teamId: adminCandidate.teamId,
            token: generateToken(adminCandidate._id)
          });
        }
      }

      // Auto-heal / Seed default Admin if '0220' entered
      if (cleanPassword === '0220') {
        let adminAccount = await User.findOne({ role: 'admin' });
        if (!adminAccount) {
          adminAccount = await User.create({
            name: 'ALPHA Chief Administrator',
            email: 'admin@alpha.klu.ac.in',
            password: '0220',
            role: 'admin'
          });
        } else {
          adminAccount.password = '0220';
          await adminAccount.save();
        }

        return res.json({
          _id: adminAccount._id,
          name: adminAccount.name,
          email: adminAccount.email,
          role: adminAccount.role,
          teamId: adminAccount.teamId,
          token: generateToken(adminAccount._id)
        });
      }
    }

    // 4. Fail-safe Volunteer Login Handler (Passcode '0509' or volunteer email)
    if (identifier.toLowerCase() === 'volunteer@alpha.klu.ac.in' || cleanPassword === '0509' || !identifier) {
      const volunteerUsers = await User.find({ role: 'volunteer' });
      for (const volCandidate of volunteerUsers) {
        if (await volCandidate.matchPassword(cleanPassword)) {
          return res.json({
            _id: volCandidate._id,
            name: volCandidate.name,
            email: volCandidate.email,
            role: volCandidate.role,
            volunteerId: volCandidate.volunteerId,
            attendancePermission: volCandidate.attendancePermission,
            status: volCandidate.status,
            assignedSessions: volCandidate.assignedSessions,
            token: generateToken(volCandidate._id)
          });
        }
      }

      // Auto-heal / Seed default Volunteer if '0509' entered
      if (cleanPassword === '0509') {
        let volAccount = await User.findOne({ role: 'volunteer' });
        if (!volAccount) {
          volAccount = await User.create({
            name: 'ALPHA Attendance Volunteer',
            email: 'volunteer@alpha.klu.ac.in',
            password: '0509',
            role: 'volunteer',
            volunteerId: 'VOL-0509',
            attendancePermission: true
          });
        } else {
          volAccount.password = '0509';
          volAccount.attendancePermission = true;
          await volAccount.save();
        }

        return res.json({
          _id: volAccount._id,
          name: volAccount.name,
          email: volAccount.email,
          role: volAccount.role,
          volunteerId: volAccount.volunteerId,
          attendancePermission: volAccount.attendancePermission,
          status: volAccount.status,
          assignedSessions: volAccount.assignedSessions,
          token: generateToken(volAccount._id)
        });
      }
    }

    return res.status(401).json({ message: 'Invalid credentials. Please check your passcode/password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
