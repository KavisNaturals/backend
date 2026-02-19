const { Wishlist, Product } = require('../models');

// GET /api/wishlist - get current user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product }],
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

// POST /api/wishlist - add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });

    // Check product exists
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Prevent duplicates
    const existing = await Wishlist.findOne({
      where: { user_id: req.user.id, product_id },
    });
    if (existing) return res.status(400).json({ message: 'Already in wishlist' });

    const item = await Wishlist.create({ user_id: req.user.id, product_id });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
  }
};

// DELETE /api/wishlist/:productId - remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const deleted = await Wishlist.destroy({
      where: { user_id: req.user.id, product_id: req.params.productId },
    });
    if (!deleted) return res.status(404).json({ message: 'Item not in wishlist' });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
  }
};

// GET /api/wishlist/check/:productId - check if product is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const item = await Wishlist.findOne({
      where: { user_id: req.user.id, product_id: req.params.productId },
    });
    res.json({ inWishlist: !!item });
  } catch (error) {
    res.status(500).json({ message: 'Error checking wishlist', error: error.message });
  }
};
