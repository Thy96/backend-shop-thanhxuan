import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

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

app.set("trust proxy", 1);

// CORS: List các FRONTEND domains được phép gọi API này
const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:5000',
  // Production
  'https://backend-shop-thanhxuan.vercel.app', // Admin dashboard frontend
  'https://shop-thanhxuan-deploy.vercel.app', // Customer website frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép requests không có origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origin not allowed: ${origin}`);
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
}));

// Middleware để xử lý JSON
app.use(express.json());
app.use(cookieParser()); // ✨ để read req.cookies.token trong authenticate
app.use(express.urlencoded({ extended: true }));

// Admin middleware
app.use('/api/admin', trackVisit);

// Lazy DB connection middleware — runs once per cold start on Vercel
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

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

app.use((req, res) => res.status(404).json({ message: 'Server đang được phát triển' }));
// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server đang bị lỗi' });
});

// Start server (development only — Vercel uses exported app)
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      await connectDB();
      app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
    } catch (e) {
      console.error('Không thể kết nối Database:', e);
    }
  })();
}

export default app;
