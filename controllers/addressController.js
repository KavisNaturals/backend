const { UserAddress } = require('../models');

// GET /api/users/address - get user's addresses
exports.getAddress = async (req, res) => {
  try {
    const addresses = await UserAddress.findAll({
      where: { user_id: req.user.id },
      order: [['is_default', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching address', error: error.message });
  }
};

// POST /api/users/address - create or update address
exports.saveAddress = async (req, res) => {
  try {
    const {
      first_name, last_name, flat_house_no, area_street,
      landmark, pincode, city, state, country, phone, is_default
    } = req.body;

    // If setting as default, unset all others
    if (is_default) {
      await UserAddress.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    // Upsert: if user has a default address update it, else create
    const existing = await UserAddress.findOne({
      where: { user_id: req.user.id, is_default: true },
    });

    if (existing) {
      await existing.update({
        first_name, last_name, flat_house_no, area_street,
        landmark, pincode, city, state, country, phone,
        is_default: true,
      });
      return res.json(existing);
    }

    const address = await UserAddress.create({
      user_id: req.user.id,
      first_name, last_name, flat_house_no, area_street,
      landmark, pincode, city, state, country, phone,
      is_default: true,
    });
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Error saving address', error: error.message });
  }
};

// PUT /api/users/address/:id - update specific address
exports.updateAddress = async (req, res) => {
  try {
    const address = await UserAddress.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    if (req.body.is_default) {
      await UserAddress.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    await address.update(req.body);
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

// DELETE /api/users/address/:id
exports.deleteAddress = async (req, res) => {
  try {
    const deleted = await UserAddress.destroy({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!deleted) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};
