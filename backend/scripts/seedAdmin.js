const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://SivaPrasad:Siva%402357@cluster0.yub04.mongodb.net/TrackIt?retryWrites=true&w=majority';

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('Connected to Live MongoDB Atlas for seeding...');

    const email = 'admin@gmail.com';
    const plainPassword = '123456';

    let admin = await User.findOne({ email });

    if (admin) {
      admin.password = plainPassword;
      admin.role = 'admin';
      admin.name = 'Admin User';
      await admin.save();
      console.log('Admin account verified; password synced to 123456 successfully!');
    } else {
      admin = await User.create({
        name: 'Admin User',
        email,
        password: plainPassword,
        role: 'admin'
      });
      console.log('Created default admin credentials: admin@gmail.com / 123456');
    }

    await mongoose.connection.close();
    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
