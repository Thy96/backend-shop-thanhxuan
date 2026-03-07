import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) throw new Error('MongoDB URI is missing.');

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err: any) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};