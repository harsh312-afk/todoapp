const mongoose = require('mongoose');

let isConnected = false;

async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/fullstackdb';

  if (process.env.NODE_ENV === 'test' && !process.env.MONGODB_URI) {
    console.log('[DB] Running in test mode without external MongoDB URI. Using in-memory fallback.');
    return false;
  }

  try {
    // serverSelectionTimeoutMS prevents hanging for 30s if local MongoDB daemon is not running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[DB] MongoDB connected successfully to ${mongoUri}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[DB] Could not connect to MongoDB (${error.message}).`);
    console.warn('[DB] Falling back to In-Memory data store for active session.');
    console.warn('[DB] To persist data permanently, ensure MongoDB is running or configure MONGODB_URI in backend/.env');
    return false;
  }
}

async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  disconnectDB,
  isDbConnected,
};
