const { Category, Product } = require('../models');
const { Op } = require('sequelize');

// GET /api/categories - public
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// GET /api/categories/from-products - derive categories from existing products
exports.getCategoriesFromProducts = async (req, res) => {
  try {
    const rows = await Product.findAll({
      attributes: ['category'],
      group: ['category'],
      where: { category: { [Op.ne]: null } },
    });
    const categories = rows.map(r => r.category).filter(Boolean);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Admin endpoints
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['sort_order', 'ASC']] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.update(req.body);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};
