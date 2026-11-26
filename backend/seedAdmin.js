const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';
const ADMIN_NAME = 'Admin User';

async function ensureAdminInDB(uri, label) {
  if (!uri) {
    console.log(`[${label}] Skipping: No URI provided.`);
    return;
  }

  console.log(`\n========================================`);
  console.log(`[${label}] Connecting to database...`);
  console.log(`========================================`);

  try {
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 10000
    }).asPromise();

    console.log(`[${label}] Connected: ${conn.host}/${conn.name}`);

    // Register User model on this connection
    const UserModel = conn.model('User', User.schema);

    let admin = await UserModel.findOne({ email: ADMIN_EMAIL });

    if (!admin) {
      console.log(`[${label}] Default admin not found. Creating admin...`);
      admin = await UserModel.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log(`[${label}] Default admin successfully created:`);
      console.log(`  - ID: ${admin._id}`);
      console.log(`  - Email: ${admin.email}`);
      console.log(`  - Role: ${admin.role}`);
    } else {
      console.log(`[${label}] Default admin already exists (ID: ${admin._id}). Checking password hash...`);
      const isMatch = await admin.matchPassword(ADMIN_PASSWORD);
      if (!isMatch) {
        console.log(`[${label}] Password does not match. Resetting password to default...`);
        admin.password = ADMIN_PASSWORD;
        await admin.save();
        console.log(`[${label}] Password updated and re-hashed successfully.`);
      } else {
        console.log(`[${label}] Password verified and matches default.`);
      }
    }

    // Final verification check
    const verifiedAdmin = await UserModel.findOne({ email: ADMIN_EMAIL });
    const verifiedMatch = await verifiedAdmin.matchPassword(ADMIN_PASSWORD);
    console.log(`[${label}] Final Login Test Status: ${verifiedMatch ? 'SUCCESS (Ready to log in)' : 'FAILED'}`);

    await conn.close();
    console.log(`[${label}] Connection closed.`);
  } catch (error) {
    console.error(`[${label}] Error ensuring admin user:`, error.message);
  }
}

async function run() {
  const localUri = process.env.MONGO_LOCAL_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TrackIt';
  const prodUri = process.env.MONGO_PROD_URI;

  console.log('Starting Default Admin Seeder for TrackIt...');
  console.log(`Target Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  // 1. Ensure in Live Production Atlas DB
  if (prodUri) {
    await ensureAdminInDB(prodUri, 'LIVE ATLAS DATABASE');
  } else {
    console.log('\n[LIVE ATLAS DATABASE] No MONGO_PROD_URI defined in backend/.env');
  }

  // 2. Ensure in Local MongoDB
  await ensureAdminInDB(localUri, 'LOCAL DATABASE');

  console.log('\n========================================');
  console.log('Default Admin Initialization Finished!');
  console.log('Credentials:');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('========================================\n');
  process.exit(0);
}

run();
