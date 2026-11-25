const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // In production, use Atlas/live cloud URI. In local/development, use local MongoDB URI
    const mongoUri = isProduction
      ? (process.env.MONGO_PROD_URI || process.env.MONGO_URI)
      : (process.env.MONGO_LOCAL_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TrackIt');

    console.log(`Connecting to MongoDB (${isProduction ? 'Production Live' : 'Local 27017'})...`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    
    // If running in development, attempt localhost fallback if 127.0.0.1 had an issue
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Attempting fallback to mongodb://localhost:27017/TrackIt...');
        const fallbackConn = await mongoose.connect('mongodb://localhost:27017/TrackIt', {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`Local MongoDB Connected via fallback: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackErr) {
        console.error(`Local MongoDB fallback failed: ${fallbackErr.message}`);
      }
    }
  }
};

module.exports = connectDB;
