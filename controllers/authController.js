const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const ACCESS_EXPIRY = '1d';       // short-lived access token
const REFRESH_EXPIRY = '30d';     // long-lived refresh token

function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
}

function signRefresh(payload) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
  return jwt.sign(payload, secret, { expiresIn: REFRESH_EXPIRY });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const tokenPayload = { id: user.id, role: user.role };
    const token = signAccess(tokenPayload);
    const refreshToken = signRefresh(tokenPayload);

    res.status(201).json({ token, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const tokenPayload = { id: user.id, role: user.role };
    const token = signAccess(tokenPayload);
    const refreshToken = signRefresh(tokenPayload);

    res.json({ token, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, secret);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Ensure user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const tokenPayload = { id: user.id, role: user.role };
    const token = signAccess(tokenPayload);
    const newRefreshToken = signRefresh(tokenPayload);

    res.json({ token, refreshToken: newRefreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error refreshing token', error: error.message });
  }
};
