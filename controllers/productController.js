const { Product, Review } = require('../models');
const { Op } = require('sequelize');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, sort, featured } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category && category !== 'All Products') {
      where.category = category;
    }

    if (featured === 'true') {
      where.is_featured = true;
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'price-low') order = [['price', 'ASC']];
    else if (sort === 'price-high') order = [['price', 'DESC']];
    else if (sort === 'rating') order = [['rating', 'DESC']];
    else if (sort === 'name') order = [['name', 'ASC']];

    const products = await Product.findAll({ where, order });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      price: parseFloat(req.body.price) || 0,
      original_price: req.body.original_price ? parseFloat(req.body.original_price) : null,
      stock: parseInt(req.body.stock) || 0
    };
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const productData = {
      ...req.body,
      price: req.body.price ? parseFloat(req.body.price) : product.price,
      original_price: req.body.original_price ? parseFloat(req.body.original_price) : product.original_price,
      stock: req.body.stock !== undefined ? parseInt(req.body.stock) : product.stock
    };
    await product.update(productData);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
