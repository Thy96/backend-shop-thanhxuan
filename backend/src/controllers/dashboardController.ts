import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import ProductModel from "../models/productModel";
import NoteModel from "../models/noteModel";
import Order from "../models/orderProductModel";
import VisitModel from "../models/visitModel";

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  const [totalProducts, totalPosts, totalOrders] = await Promise.all([
    ProductModel.countDocuments(),
    NoteModel.countDocuments(),
    Order.countDocuments(),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  const revenue = revenueAgg[0]?.total || 0;

  res.json({
    totalProducts,
    totalPosts,
    totalOrders,
    revenue,
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