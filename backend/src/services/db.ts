import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) throw new Error('MongoDB URI is missing.');

// Cache connection across serverless invocations
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB Connected');
  } catch (err: any) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    throw err; // let caller handle — no process.exit() in serverless
  }
};