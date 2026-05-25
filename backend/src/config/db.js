const mongoose = require('mongoose');
const MockModel = require('../utils/dbFallback');
require('dotenv').config();

const isMock = !process.env.MONGODB_URI;

const connectDB = async () => {
  if (isMock) {
    console.log('⚠️  [Database] MONGODB_URI is empty. Operating in offline mode using JSON-file storage!');
    return true;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🚀 [Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ [Database] MongoDB Connection failed: ${error.message}`);
    console.log('⚠️  [Database] Falling back to local JSON-file storage!');
    return false;
  }
};

const getModel = (name, mongooseSchema = null) => {
  // If we are in mock mode, return our mock wrapper
  if (isMock) {
    return new MockModel(name.toLowerCase() + 's');
  }
  try {
    if (mongoose.models[name]) {
      return mongoose.models[name];
    }
    return mongoose.model(name, mongooseSchema);
  } catch (e) {
    console.warn(`⚠️  [Database] Schema compilation error for ${name}, using local JSON fallback:`, e.message);
    return new MockModel(name.toLowerCase() + 's');
  }
};

module.exports = { connectDB, getModel, isMock };
