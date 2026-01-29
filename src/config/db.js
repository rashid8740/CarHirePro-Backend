import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  // If already connected, return early
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/carhirepro';
    
    if (!process.env.MONGO_URI) {
      console.warn('⚠️ MONGO_URI not set, using default localhost');
    }
    
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit in serverless - let it retry on next request
    // process.exit(1) would crash the Vercel function
    isConnected = false;
  }
};

export default connectDB;
