
const { Review, User, Product } = require('../models');

exports.addReview = async (req, res) => {
  try {
    const { rating, comment, user_name } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if user already reviewed (optional logic, skipping for flexibility)

    const review = await Review.create({
      product_id: productId,
      user_id: userId,
      rating,
      comment,
      user_name: user_name || req.user.name || 'Anonymous'
    });

    // Update product rating and review count
    const product = await Product.findByPk(productId);
    if (product) {
      const reviews = await Review.findAll({ where: { product_id: productId } });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await product.update({
        rating: avgRating.toFixed(1),
        reviews_count: reviews.length
      });
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.findAll({
      where: { product_id: productId },
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};
