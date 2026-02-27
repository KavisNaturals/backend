const sequelize = require('../config/database');

const statuses = ['pending', 'processing', 'out_for_delivery', 'shipped', 'delivered', 'cancelled', 'returned'];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    for (const v of statuses) {
      try {
        await sequelize.query(`ALTER TYPE "enum_Orders_delivery_status" ADD VALUE IF NOT EXISTS '${v}'`);
        console.log('Ensured:', v);
      } catch (e) {
        console.log('Skip:', v, '-', e.message.slice(0, 80));
      }
    }
    console.log('Migration complete. Restart the backend server now.');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
})();
