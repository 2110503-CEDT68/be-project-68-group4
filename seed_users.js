const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
mongoose.connect(process.env.MONGO_URI);

const seedUsers = async () => {
  try {
    // Delete existing users with these emails
    await User.deleteMany({ 
      email: { $in: ['admin@gmail.com', 'user8@gmail.com'] } 
    });

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: '12345678',
      role: 'admin',
      tel: '0812345678'
    });

    // Create regular user
    const user = await User.create({
      name: 'User Eight',
      email: 'user8@gmail.com',
      password: '12345678',
      role: 'user',
      tel: '0898765432'
    });

    console.log('Users created successfully:'.green.inverse);
    console.log(`Admin: ${admin.email}`.green);
    console.log(`User: ${user.email}`.green);

    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`.red);
    process.exit(1);
  }
};

seedUsers();
