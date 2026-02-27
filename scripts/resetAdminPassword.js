const sequelize = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // New password
    const newPassword = 'NewPassword123';
    const hashedPassword = '$2b$10$RPn8t6pNRH.IQEEHJrH9geU0YOpgfmCYZXm30MZvs/PUACOIL.PYu';

    // Update admin user
    const updated = await User.update(
      { password: hashedPassword },
      { where: { role: 'admin' } }
    );

    console.log(`\n✅ Password reset successfully!\n`);
    console.log(`Email: admin@kavisnaturals.cloud`);
    console.log(`Password: ${newPassword}\n`);
    console.log(`Updated ${updated[0]} admin user(s)`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
