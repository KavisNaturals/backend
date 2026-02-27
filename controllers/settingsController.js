const { SiteSettings } = require('../models');

const DEFAULTS = {
  social_links: JSON.stringify({ facebook: '', instagram: '', twitter: '', youtube: '' }),
};

// Ensure default rows exist
const ensureDefaults = async () => {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await SiteSettings.findOrCreate({ where: { key }, defaults: { key, value } });
  }
};

// GET /api/settings/:key  (public)
exports.get = async (req, res) => {
  try {
    await ensureDefaults();
    const setting = await SiteSettings.findOne({ where: { key: req.params.key } });
    if (!setting) return res.status(404).json({ message: 'Setting not found' });
    try {
      res.json({ key: setting.key, value: JSON.parse(setting.value) });
    } catch {
      res.json({ key: setting.key, value: setting.value });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching setting', error: error.message });
  }
};

// GET /api/settings  (admin - all settings)
exports.getAll = async (req, res) => {
  try {
    await ensureDefaults();
    const settings = await SiteSettings.findAll();
    const result = {};
    for (const s of settings) {
      try { result[s.key] = JSON.parse(s.value); } catch { result[s.key] = s.value; }
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// PUT /api/settings/:key  (admin)
exports.update = async (req, res) => {
  try {
    const { value } = req.body;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const [setting] = await SiteSettings.findOrCreate({
      where: { key: req.params.key },
      defaults: { key: req.params.key, value: serialized },
    });
    await setting.update({ value: serialized });
    try {
      res.json({ key: setting.key, value: JSON.parse(setting.value) });
    } catch {
      res.json({ key: setting.key, value: setting.value });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
};
