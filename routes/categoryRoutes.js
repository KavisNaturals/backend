const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public
router.get('/', categoryController.getActiveCategories);
router.get('/from-products', categoryController.getCategoriesFromProducts);

// Admin only
router.get('/all', auth, admin, categoryController.getAllCategories);
router.post('/', auth, admin, categoryController.createCategory);
router.put('/:id', auth, admin, categoryController.updateCategory);
router.delete('/:id', auth, admin, categoryController.deleteCategory);

module.exports = router;
