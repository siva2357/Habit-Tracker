const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_LOCAL_URI).then(async () => {
  await mongoose.connection.db.dropDatabase();
  console.log('Database dropped');
  process.exit(0);
});
