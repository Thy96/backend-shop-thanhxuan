import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import ProductModel from "../models/productModel";
import NoteModel from "../models/noteModel";
import Order from "../models/orderProductModel";
import VisitModel from "../models/visitModel";
import UserModel from "../models/userModel";

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const monthStart = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
  const monthEnd = new Date(year, month, 1); // first day of next month

  const [totalProducts, totalPosts, totalOrders] = await Promise.all([
    ProductModel.countDocuments(),
    NoteModel.countDocuments(),
    Order.countDocuments(),
  ]);

  const [monthlyAgg, yearlyAgg] = await Promise.all([
    Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31T23:59:59`) } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  res.json({
    totalProducts,
    totalPosts,
    totalOrders,
    monthlyRevenue: monthlyAgg[0]?.total || 0,
    yearlyRevenue: yearlyAgg[0]?.total || 0,
  });
};

export const getRevenueByMonth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const year = new Date().getFullYear();

    const revenue = await Order.aggregate([
      {
        $match: {
          status: 'completed', // chỉ tính đơn đã thanh toán
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          value: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thống kê doanh thu' });
  }
};

export const getTopProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const topProducts = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thống kê sản phẩm bán chạy' });
  }
};

export const getTopUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const topUsers = await UserModel.find({ role: 'user' })
      .select('fullName email points')
      .sort({ points: -1 })
      .limit(limit)
      .lean();

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thống kê user tích điểm' });
  }
};

export const getVisitsByMonth = async (req: AuthenticatedRequest, res: Response) => {
  const year = new Date().getFullYear();

  const visits = await VisitModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        value: { $sum: 1 },
      },
    },
    { $sort: { '_id': 1 } },
  ]);

  res.json(visits);
};