import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) throw new Error('MongoDB URI is missing.');

export const connectDB = async () => {
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err: any) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    throw err; // let caller handle — no process.exit() in serverless
  }
};