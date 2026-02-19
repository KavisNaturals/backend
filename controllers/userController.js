
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { upload, getUploadUrl } = require('../middleware/uploadMiddleware');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
         user.password = await bcrypt.hash(req.body.password, 10);
      }

      const updatedUser = await user.save();
      
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Expose multer middleware for the avatar route
exports.uploadAvatarMiddleware = upload.single('avatar');

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatar = getUploadUrl(req.file.filename);
    await user.save();

    res.json({ avatar: user.avatar, message: 'Avatar updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating avatar', error: error.message });
  }
};
