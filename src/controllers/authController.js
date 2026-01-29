import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role });
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  return res.json(req.user);
};

// Create demo users if they don't exist
export const createDemoUsers = async () => {
  try {
    const demoUsers = [
      { name: 'Director User', email: 'director@carhire.com', password: 'password123', role: 'Director' },
      { name: 'Staff User', email: 'staff@carhire.com', password: 'password123', role: 'Staff' },
      { name: 'Owner User', email: 'owner@carhire.com', password: 'password123', role: 'Owner' },
      { name: 'Client User', email: 'client@carhire.com', password: 'password123', role: 'Client' }
    ];

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
        console.log(`✅ Created demo user: ${userData.email}`);
      }
    }
  } catch (err) {
    console.error('❌ Error creating demo users:', err.message);
  }
};


