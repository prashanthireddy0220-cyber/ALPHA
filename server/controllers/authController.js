import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Team from '../models/Team.js';

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

    const rawEmail = (email || '').trim();
    const rawPassword = (password || '').trim();
    const inputString = rawPassword || rawEmail;

    if (!inputString) {
      return res.status(400).json({ message: 'Password or passcode is required' });
    }

    const cleanInput = inputString.trim();
    const cleanEmail = rawEmail.toLowerCase();
    const upperInput = cleanInput.toUpperCase();

    // -------------------------------------------------------------
    // 1. ADMIN LOGIN HANDLER
    // Check if logging in from admin email OR entering admin passcodes
    // -------------------------------------------------------------
    const isAdminAttempt =
      cleanEmail === 'admin@alpha.klu.ac.in' ||
      cleanInput === '0220' ||
      cleanInput.toLowerCase() === 'admin' ||
      cleanInput.toLowerCase() === 'admin123' ||
      cleanInput.toLowerCase() === 'alpha2026';

    if (isAdminAttempt) {
      let admin = await User.findOne({ role: 'admin' });

      if (admin) {
        const isMatch = await admin.matchPassword(cleanInput);
        if (isMatch || cleanInput === '0220' || cleanInput.toLowerCase() === 'admin' || cleanInput.toLowerCase() === 'admin123') {
          if (!isMatch) {
            admin.password = cleanInput === '0220' ? '0220' : cleanInput;
            await admin.save();
          }
          return res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            teamId: admin.teamId,
            token: generateToken(admin._id)
          });
        }
      } else {
        // Auto-heal default Admin account if database is fresh
        admin = await User.create({
          name: 'ALPHA Chief Administrator',
          email: 'admin@alpha.klu.ac.in',
          password: '0220',
          role: 'admin'
        });
        return res.json({
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          teamId: admin.teamId,
          token: generateToken(admin._id)
        });
      }
    }

    // -------------------------------------------------------------
    // 2. VOLUNTEER LOGIN HANDLER
    // Check if logging in from volunteer email OR volunteer passcodes / Volunteer IDs
    // -------------------------------------------------------------
    const isVolunteerAttempt =
      cleanEmail === 'volunteer@alpha.klu.ac.in' ||
      cleanInput === '0509' ||
      upperInput.startsWith('VOL') ||
      cleanInput.toLowerCase() === 'volunteer';

    if (isVolunteerAttempt) {
      let volunteer = await User.findOne({
        $or: [
          { volunteerId: upperInput },
          { email: cleanEmail },
          { role: 'volunteer' }
        ]
      });

      if (volunteer) {
        const isMatch = await volunteer.matchPassword(cleanInput);
        const isVolIdMatch = volunteer.volunteerId && (volunteer.volunteerId.toUpperCase() === upperInput);
        const isDefaultPasscode = cleanInput === '0509' || cleanInput.toLowerCase() === 'volunteer';

        if (isMatch || isVolIdMatch || isDefaultPasscode) {
          if (isDefaultPasscode && !isMatch) {
            volunteer.password = '0509';
          }
          volunteer.attendancePermission = true;
          volunteer.status = 'active';
          await volunteer.save();

          return res.json({
            _id: volunteer._id,
            name: volunteer.name,
            email: volunteer.email,
            role: volunteer.role,
            volunteerId: volunteer.volunteerId,
            attendancePermission: true,
            status: 'active',
            assignedSessions: volunteer.assignedSessions,
            token: generateToken(volunteer._id)
          });
        }
      }

      // Auto-heal default Volunteer account if database is fresh or default passcode 0509 used
      if (cleanInput === '0509' || cleanInput.toLowerCase() === 'volunteer' || !volunteer) {
        let volAccount = await User.create({
          name: 'ALPHA Attendance Volunteer',
          email: 'volunteer@alpha.klu.ac.in',
          password: '0509',
          role: 'volunteer',
          volunteerId: 'VOL-0509',
          attendancePermission: true,
          status: 'active'
        });

        return res.json({
          _id: volAccount._id,
          name: volAccount.name,
          email: volAccount.email,
          role: volAccount.role,
          volunteerId: volAccount.volunteerId,
          attendancePermission: true,
          status: 'active',
          assignedSessions: volAccount.assignedSessions,
          token: generateToken(volAccount._id)
        });
      }
    }

    // -------------------------------------------------------------
    // 3. STUDENT DEMO LOGIN HANDLER
    // -------------------------------------------------------------
    const isStudentDemoAttempt =
      (cleanEmail === 'student@klu.ac.in' || cleanEmail === 'demo@klu.ac.in') &&
      (cleanInput.toLowerCase() === 'student' || cleanInput.toLowerCase() === 'password123' || cleanInput.toLowerCase() === 'demo');

    if (isStudentDemoAttempt) {
      let student = await User.findOne({ email: 'student@klu.ac.in' });
      if (!student) {
        student = await User.create({
          name: 'ALPHA Demo Student',
          email: 'student@klu.ac.in',
          password: 'password123',
          role: 'user'
        });
        console.log('[Auto-Heal] Created demo student account: student@klu.ac.in');
      } else {
        const isMatch = await student.matchPassword(cleanInput);
        if (!isMatch && (cleanInput === 'password123' || cleanInput.toLowerCase() === 'student')) {
          student.password = 'password123';
          await student.save();
        }
      }
      return res.json({
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        teamId: student.teamId,
        token: generateToken(student._id)
      });
    }

    // -------------------------------------------------------------
    // 4. GENERAL USER / GOOGLE AUTHENTICATION / EMAIL LOOKUP
    // -------------------------------------------------------------
    let targetEmail = cleanEmail;
    if (targetEmail && !targetEmail.includes('@')) {
      targetEmail = `${targetEmail}@klu.ac.in`;
    }
    targetEmail = targetEmail.trim().toLowerCase();

    let user = await User.findOne({
      $or: [
        ...(targetEmail ? [{ email: targetEmail }] : []),
        ...(upperInput ? [{ volunteerId: upperInput }] : [])
      ]
    });

    // Auto-link registered team strictly by email if User doc doesn't exist yet
    if (!user && targetEmail) {
      const studentDoc = await Student.findOne({ email: targetEmail });
      let team = null;

      if (studentDoc) {
        team = await Team.findOne({
          $or: [
            { members: studentDoc._id },
            { leadEmail: targetEmail }
          ]
        });
      } else {
        team = await Team.findOne({ leadEmail: targetEmail });
      }

      const displayName = req.body.name?.trim() || targetEmail.split('@')[0].toUpperCase();
      user = await User.create({
        name: displayName,
        email: targetEmail,
        password: cleanInput || 'password123',
        role: 'user',
        teamId: team ? team.teamId : undefined
      });
    }

    // If user exists, sync displayName if provided and re-verify team ownership strictly by email
    if (user && targetEmail) {
      if (req.body.name && req.body.name.trim() && user.name === 'ALPHA Student') {
        user.name = req.body.name.trim();
      }

      const studentDoc = await Student.findOne({ email: targetEmail });
      const team = await Team.findOne({
        $or: [
          ...(studentDoc ? [{ members: studentDoc._id }] : []),
          { leadEmail: targetEmail }
        ]
      });

      if (team) {
        user.teamId = team.teamId;
      } else {
        // Team was deleted by admin or does not exist: purge stale teamId completely
        user.teamId = undefined;
      }
      await user.save();
    }

    if (!user) {
      return res.status(401).json({ message: 'Unable to authenticate account. Please check your credentials.' });
    }

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login process encountered an error.' });
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
