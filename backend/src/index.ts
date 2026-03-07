import dotenv from 'dotenv'
dotenv.config()

import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from 'cookie-parser';

import noteCategoryRoutes from "./routes/noteCategoryRoutes";
import productCategoryRoutes from "./routes/productCategoryRoutes";
import notesRoutes from "./routes/noteRoutes";
import productsRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes"
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoues';
import userRoutes from './routes/userRoutes'
import dashboardRoutes from './routes/dashboardRoutes'

import { connectDB } from "./services/db";

import { trackVisit } from './middlewares/trackVisit';

const app = express();
const adminRouter = express.Router();
export const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000'
  ], // Cho phép frontend của bạn
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // thêm Authorization nếu cần
  credentials: true // <-- Quan trọng nếu có cookie / auth, nếu dùng cookie jwt
}));

// Middleware để xử lý JSON
app.use(express.json());
app.use(cookieParser()); // ✨ để read req.cookies.token trong authenticate
app.use(express.urlencoded({ extended: true }));

// Admin middleware
app.use('/api/admin', trackVisit);

// Routes
adminRouter.use('/notes/categories', noteCategoryRoutes);
adminRouter.use('/products/categories', productCategoryRoutes);
adminRouter.use('/notes', notesRoutes);
adminRouter.use('/products', productsRoutes);
adminRouter.use('/orders', orderRoutes);
adminRouter.use('/auth', authRoutes);
adminRouter.use('/users', userRoutes);
adminRouter.use('/dashboard', dashboardRoutes);
adminRouter.use('/uploads', uploadRoutes);

app.use('/api/admin', adminRouter);

// Static
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Start server
(async () => {
  try {
    // Kết nối MongoDB
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
  } catch (e) {
    console.error('DB connect failed:', e);
    process.exit(1);
  }
})();
