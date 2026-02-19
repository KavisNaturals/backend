const { Concern } = require('../models');

// GET /api/concerns - public
exports.getActiveConcerns = async (req, res) => {
  try {
    const concerns = await Concern.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
    });
    res.json(concerns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching concerns', error: error.message });
  }
};

// Admin endpoints
exports.getAllConcerns = async (req, res) => {
  try {
    const concerns = await Concern.findAll({ order: [['sort_order', 'ASC']] });
    res.json(concerns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching concerns', error: error.message });
  }
};

exports.createConcern = async (req, res) => {
  try {
    const concern = await Concern.create(req.body);
    res.status(201).json(concern);
  } catch (error) {
    res.status(500).json({ message: 'Error creating concern', error: error.message });
  }
};

exports.updateConcern = async (req, res) => {
  try {
    const concern = await Concern.findByPk(req.params.id);
    if (!concern) return res.status(404).json({ message: 'Concern not found' });
    await concern.update(req.body);
    res.json(concern);
  } catch (error) {
    res.status(500).json({ message: 'Error updating concern', error: error.message });
  }
};

exports.deleteConcern = async (req, res) => {
  try {
    const concern = await Concern.findByPk(req.params.id);
    if (!concern) return res.status(404).json({ message: 'Concern not found' });
    await concern.destroy();
    res.json({ message: 'Concern deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting concern', error: error.message });
  }
};
