
const { Review, User, Product } = require('../models');

exports.addReview = async (req, res) => {
  try {
    const { rating, comment, user_name, place, reviewer_image } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    const review = await Review.create({
      product_id: productId,
      user_id: userId,
      rating,
      comment,
      user_name: user_name || req.user.name || 'Anonymous',
      place: place || null,
      reviewer_image: reviewer_image || null,
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

// GET /api/reviews/featured - latest high-rated reviews for homepage
exports.getFeaturedReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const reviews = await Review.findAll({
      where: { rating: { [require('sequelize').Op.gte]: 4 } },
      include: [{ model: Product, attributes: ['id', 'name', 'image_path'] }],
      order: [['createdAt', 'DESC']],
      limit,
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured reviews', error: error.message });
  }
};

// GET /api/reviews - admin: all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [{ model: Product, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// DELETE /api/reviews/:id - admin: delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.destroy();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

// POST /api/reviews - admin: create a review for any product
exports.adminCreateReview = async (req, res) => {
  try {
    const { product_id, rating, comment, user_name, place, reviewer_image } = req.body;
    if (!product_id || !rating || !user_name) {
      return res.status(400).json({ message: 'product_id, rating and user_name are required' });
    }
    const review = await Review.create({
      product_id,
      user_id: req.user.id,
      rating: Number(rating),
      comment: comment || '',
      user_name,
      place: place || null,
      reviewer_image: reviewer_image || null,
    });
    // Update product avg rating
    const product = await Product.findByPk(product_id);
    if (product) {
      const reviews = await Review.findAll({ where: { product_id } });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await product.update({ rating: avgRating.toFixed(1), reviews_count: reviews.length });
    }
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// PUT /api/reviews/:id - admin: update a review
exports.adminUpdateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const { rating, comment, user_name, place, reviewer_image } = req.body;
    await review.update({
      ...(rating !== undefined && { rating: Number(rating) }),
      ...(comment !== undefined && { comment }),
      ...(user_name !== undefined && { user_name }),
      ...(place !== undefined && { place }),
      ...(reviewer_image !== undefined && { reviewer_image }),
    });
    // Update product avg rating
    const product = await Product.findByPk(review.product_id);
    if (product) {
      const reviews = await Review.findAll({ where: { product_id: review.product_id } });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await product.update({ rating: avgRating.toFixed(1), reviews_count: reviews.length });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

