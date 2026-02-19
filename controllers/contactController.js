const { ContactMessage } = require('../models');

// POST /api/contact - submit contact form (public)
exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }
    const contact = await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: 'Message sent successfully', id: contact.id });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting contact form', error: error.message });
  }
};

// Admin endpoints
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    await msg.update({ is_read: true });
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
};
