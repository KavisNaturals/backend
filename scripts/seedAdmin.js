require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { User } = require('../models');

const ADMIN_EMAIL = 'admin@kavisnaturals.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = "Kavi's Naturals Admin";

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    await sequelize.sync({ alter: true });

    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      // Update role to admin in case it was a regular user
      await existing.update({ role: 'admin' });
      console.log(`Admin user already exists. Role confirmed as "admin".`);
      console.log(`Email: ${ADMIN_EMAIL}`);
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Super admin created successfully!');
      console.log(`   Email:    ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  } finally {
    await sequelize.close();
  }
};

seedAdmin();
