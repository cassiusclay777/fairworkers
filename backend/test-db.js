const { User } = require('./db-models');

async function checkUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'display_name']
    });

    console.log(`\n✅ Found ${users.length} users in database:\n`);
    users.forEach(user => {
      console.log(`  - ${user.display_name || user.email} (${user.role})`);
    });

    // Test password for first user
    if (users.length > 0) {
      const testUser = await User.findOne({ where: { email: 'petra.k@fairworkers.com' } });
      if (testUser) {
        const isValid = await testUser.comparePassword('Petra123!');
        console.log(`\n🔐 Password test for petra.k@fairworkers.com: ${isValid ? '✅ WORKS' : '❌ FAILED'}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
