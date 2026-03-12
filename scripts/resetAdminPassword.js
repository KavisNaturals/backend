const sequelize = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // New password
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update admin user by email
    const updated = await User.update(
      { password: hashedPassword, role: 'admin' },
      { where: { email: 'admin@kavisnaturals.com' } }
    );

    console.log(`\n✅ Password reset successfully!\n`);
    console.log(`Email: admin@kavisnaturals.com`);
    console.log(`Password: ${newPassword}\n`);
    console.log(`Updated ${updated[0]} admin user(s)`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
