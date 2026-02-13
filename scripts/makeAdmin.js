
const { User } = require('../models');
const sequelize = require('../config/database');

const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address.');
  console.log('Usage: node scripts/makeAdmin.js <email>');
  process.exit(1);
}

const makeAdmin = async () => {
  try {
    // Ensure DB connection
    await sequelize.authenticate();
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    
    console.log(`Success! User ${user.name} (${user.email}) is now an Admin.`);
    console.log('Please Log Out and Log In again for changes to take effect.');
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await sequelize.close();
  }
};

makeAdmin();
