const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.db.dropDatabase();
  console.log('Cloud Database dropped completely');
  process.exit(0);
}).catch(console.error);
