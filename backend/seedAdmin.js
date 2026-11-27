const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';
const ADMIN_NAME = 'Admin User';

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://SivaPrasad:Siva%402357@cluster0.yub04.mongodb.net/TrackIt?retryWrites=true&w=majority';

  console.log('Connecting to Live MongoDB Atlas for Admin verification...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`Connected to Live DB: ${mongoose.connection.host}/${mongoose.connection.name}`);

    let admin = await User.findOne({ email: ADMIN_EMAIL });

    if (!admin) {
      console.log('Admin not found in live database. Creating admin user...');
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log('Default admin created successfully: admin@gmail.com / 123456');
    } else {
      console.log('Admin user found. Verifying password...');
      const isMatch = await admin.matchPassword(ADMIN_PASSWORD);
      if (!isMatch) {
        admin.password = ADMIN_PASSWORD;
        await admin.save();
        console.log('Password reset to default 123456 and re-hashed successfully.');
      } else {
        console.log('Admin password verified: ready for login.');
      }
    }

    await mongoose.connection.close();
    console.log('Admin check completed. Live database is fully ready!');
    process.exit(0);
  } catch (error) {
    console.error('Error during admin seeding:', error.message);
    process.exit(1);
  }
}

run();
