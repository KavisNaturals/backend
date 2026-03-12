const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://kavisnaturals.in',
  'https://www.kavisnaturals.in',
  'https://kavisnaturals.vercel.app',
  'https://www.kavisnaturals.cloud',
  'https://kavisnaturals.cloud',
  'https://api.kavisnaturals.cloud'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    /^https:\/\/kavisnaturals(-[a-z0-9-]+)?\.vercel\.app$/.test(origin);

  if (allowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const concernRoutes = require('./routes/concernRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const contactRoutes = require('./routes/contactRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const pageContentRoutes = require('./routes/pageContentRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/concerns', concernRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pageContentRoutes);

const path = require('path');
const fs = require('fs');
// Serve uploads from the configured directory (default to production path)
// keeping parity with uploadMiddleware.js which uses UPLOAD_DIR.
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/kavis/uploads';
// ensure dir exists (uploadMiddleware already creates it, but repeat safety here)
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch {};
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Database Connection and Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    
    // Ensure enum values exist in PostgreSQL before sync (ALTER TYPE ... ADD VALUE IF NOT EXISTS)
    const deliveryStatuses = ['pending', 'processing', 'out_for_delivery', 'shipped', 'delivered', 'cancelled', 'returned'];
    for (const val of deliveryStatuses) {
      try {
        await sequelize.query(`ALTER TYPE "enum_Orders_delivery_status" ADD VALUE IF NOT EXISTS '${val}'`);
      } catch (e) { /* enum or value may already exist */ }
    }

    // Sync models — alter:true adds new columns to existing tables without dropping data
    await sequelize.sync({ alter: true });
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();

