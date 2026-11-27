const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://SivaPrasad:Siva%402357@cluster0.yub04.mongodb.net/TrackIt?retryWrites=true&w=majority';

    console.log('Connecting to Live MongoDB Atlas...');

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000
    });

    cachedConn = conn;
    console.log(`Live MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
