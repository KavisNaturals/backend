/**
 * Migration: Add SEO fields to Products table
 * Run: node scripts/addProductSeoFields.js
 */
const sequelize = require('../config/database');
const { QueryInterface, DataTypes } = require('sequelize');

const queryInterface = sequelize.getQueryInterface();

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    const tableDesc = await queryInterface.describeTable('Products');

    if (!tableDesc.meta_title) {
      await queryInterface.addColumn('Products', 'meta_title', { type: DataTypes.STRING, allowNull: true });
      console.log('Added: meta_title');
    } else {
      console.log('Skipped: meta_title (already exists)');
    }

    if (!tableDesc.meta_description) {
      await queryInterface.addColumn('Products', 'meta_description', { type: DataTypes.TEXT, allowNull: true });
      console.log('Added: meta_description');
    } else {
      console.log('Skipped: meta_description (already exists)');
    }

    if (!tableDesc.meta_keywords) {
      await queryInterface.addColumn('Products', 'meta_keywords', { type: DataTypes.STRING, allowNull: true });
      console.log('Added: meta_keywords');
    } else {
      console.log('Skipped: meta_keywords (already exists)');
    }

    console.log('\n✅ SEO migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
