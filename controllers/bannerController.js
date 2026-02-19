const { Banner } = require('../models');

// GET /api/banners - public
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
};

// Admin endpoints
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [['sort_order', 'ASC']] });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    await banner.update(req.body);
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating banner', error: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    await banner.destroy();
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
};
