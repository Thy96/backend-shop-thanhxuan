import mongoose from 'mongoose';
import { Response } from 'express';

import { AuthenticatedRequest } from '../types/auth';
import { ORDER_STATUS_LABEL, OrderStatus, PaymentMethod } from '../types';

import Order from '../models/orderProductModel';
import ProductModel from '../models/productModel';
import UserModel from '../models/userModel';

export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid || !mongoose.Types.ObjectId.isValid(req.user.uid)) {
      return res.status(400).json({ message: "User không hợp lệ" });
    }

    const orders = await Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.uid)
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách order của tôi" });
  }
};

export const getAllOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = 10;

    const rawPage = Number(req.query.page) || 1;
    const page = Math.max(rawPage, 1);

    const total = await Order.countDocuments();
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const orders = await Order.aggregate([
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users", // ⚠️ đúng tên collection của user
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "user.password": 0
        }
      }
    ]);

    res.json({
      data: orders,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy orders" });
  }
}

export const getOrdersById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Order ID không hợp lệ" });
    }

    const order = await Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    if (!order.length) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    return res.json(order[0]);

  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    const validPaymentMethods = [
      'COD',
      'BANK_TRANSFER',
      'MOMO',
      'VNPAY',
      'ZALOPAY',
      'PAYPAL',
    ];

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng không hợp lệ' });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.email
    ) {
      return res.status(400).json({ message: 'Thiếu thông tin giao hàng' });
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
      }

      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        return res.status(400).json({ message: "Số lượng không hợp lệ" });
      }
    }

    const productIds = items.map(i => i.product);

    const products = await ProductModel.find({
      _id: { $in: productIds }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Có sản phẩm không tồn tại' });
    }

    const productMap = new Map(
      products.map(p => [p._id.toString(), p])
    );

    for (const item of items) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        return res.status(400).json({ message: 'Sản phẩm không tồn tại' });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Sản phẩm ${product.title} không đủ tồn kho`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || '',
        points: product.points ?? 0,
      });

      totalPrice += product.price * item.quantity;
    }

    const userId = req.user ? req.user.uid : null

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('[CREATE_ORDER_ERROR]', error);
    res.status(500).json({ message: 'Không tạo được order' });
  }
};

export const updateOrder = async (req: AuthenticatedRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body as { status: OrderStatus };

    /* --------------------------------------------------
     * 1️⃣ VALIDATE INPUT
     * -------------------------------------------------- */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new Error('Order ID không hợp lệ');
    }

    const validStatus = Object.values(OrderStatus);
    if (!validStatus.includes(status)) {
      throw new Error('Trạng thái đơn hàng không hợp lệ');
    }

    /* --------------------------------------------------
     * 2️⃣ LẤY ORDER
     * -------------------------------------------------- */

    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .session(session);

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    const currentStatus = order.status as OrderStatus;
    const nextStatus = status;

    /* --------------------------------------------------
     * 3️⃣ FSM – KIỂM SOÁT LUỒNG TRẠNG THÁI
     * -------------------------------------------------- */

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.SHIPPING, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new Error(`Không thể chuyển từ ${ORDER_STATUS_LABEL[currentStatus]} → ${ORDER_STATUS_LABEL[nextStatus]}`);
    }

    /* --------------------------------------------------
     * 4️⃣ XÁC ĐỊNH ĐÃ TRỪ KHO CHƯA
     * -------------------------------------------------- */

    const wasStockDeducted =
      currentStatus === OrderStatus.PAID ||
      currentStatus === OrderStatus.SHIPPING ||
      currentStatus === OrderStatus.COMPLETED;

    /* --------------------------------------------------
     * 5️⃣ ĐIỀU KIỆN TRỪ KHO (ONLINE + COD)
     * -------------------------------------------------- */

    const paymentMethod = order.paymentMethod as PaymentMethod;

    const ONLINE_METHODS: PaymentMethod[] = [
      PaymentMethod.MOMO,
      PaymentMethod.ZALOPAY,
      PaymentMethod.VNPAY,
    ];

    const isOnlinePayment = ONLINE_METHODS.includes(paymentMethod);

    const shouldDeductStock =
      // ONLINE: trừ kho khi PAID
      (isOnlinePayment &&
        nextStatus === OrderStatus.PAID &&
        !wasStockDeducted)
      ||
      // COD: trừ kho khi SHIPPING
      (paymentMethod === PaymentMethod.COD &&
        nextStatus === OrderStatus.SHIPPING &&
        !wasStockDeducted);

    if (shouldDeductStock) {
      for (const item of order.items) {
        const product = item.product as any;

        if (product.stock < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} không đủ tồn kho`);
        }

        await ProductModel.findByIdAndUpdate(
          product._id,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }
    }

    /* --------------------------------------------------
     * 6️⃣ HOÀN KHO KHI HUỶ (NẾU ĐÃ TRỪ)
     * -------------------------------------------------- */

    if (nextStatus === OrderStatus.CANCELLED && wasStockDeducted) {
      for (const item of order.items) {
        await ProductModel.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }

    /* --------------------------------------------------
     * 7️⃣ CẬP NHẬT TRẠNG THÁI ORDER
     * -------------------------------------------------- */

    order.status = nextStatus;
    await order.save({ session });

    /* --------------------------------------------------
     * 8️⃣ TÍCH ĐIỂM KHI HOÀN THÀNH
     * -------------------------------------------------- */

    if (nextStatus === OrderStatus.COMPLETED && order.user) {
      let totalPoints = 0;
      for (const item of order.items) {
        const pointsPerUnit = typeof item.points === 'number' ? item.points : 0;
        totalPoints += pointsPerUnit * item.quantity;
      }
      if (totalPoints > 0) {
        await UserModel.findByIdAndUpdate(
          order.user,
          { $inc: { points: totalPoints } },
          { session }
        );
      }
    }

    /* --------------------------------------------------
     * 9️⃣ COMMIT TRANSACTION
     * -------------------------------------------------- */

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      data: order,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Lỗi server không xác định' });
  }
};
