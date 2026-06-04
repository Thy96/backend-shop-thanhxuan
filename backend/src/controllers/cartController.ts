import mongoose from "mongoose";
import { Response } from "express";

import { AuthenticatedRequest } from "../types/auth";
import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";
import Order from "../models/orderProductModel";

// ──────────────────────────────────────────────
// GET /cart  — Lấy giỏ hàng của user hiện tại
// ──────────────────────────────────────────────
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const cart = await CartModel.findOne({ user: req.user!.uid });
        return res.json({ data: cart ?? { user: req.user!.uid, items: [] } });
    } catch {
        return res.status(500).json({ message: "Lỗi khi lấy giỏ hàng" });
    }
};

// ──────────────────────────────────────────────
// POST /cart/items  — Thêm sản phẩm vào giỏ
// Body: { productId, quantity }
// ──────────────────────────────────────────────
export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { productId, quantity = 1 } = req.body as {
            productId?: string;
            quantity?: number;
        };

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "productId không hợp lệ" });
        }
        if (typeof quantity !== "number" || quantity < 1) {
            return res.status(400).json({ message: "Số lượng phải >= 1" });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        if (product.isDeleted) {
            return res.status(400).json({ message: "Sản phẩm không còn tồn tại" });
        }

        let cart = await CartModel.findOne({ user: req.user!.uid });
        if (!cart) {
            cart = new CartModel({ user: req.user!.uid, items: [] });
        }

        const existingIdx = cart.items.findIndex(
            (i) => i.product.toString() === productId
        );

        if (existingIdx >= 0) {
            const newQty = cart.items[existingIdx].quantity + quantity;
            if (product.stock > 0 && newQty > product.stock) {
                return res
                    .status(400)
                    .json({ message: `Chỉ còn ${product.stock} sản phẩm trong kho` });
            }
            cart.items[existingIdx].quantity = newQty;
        } else {
            if (product.stock > 0 && quantity > product.stock) {
                return res
                    .status(400)
                    .json({ message: `Chỉ còn ${product.stock} sản phẩm trong kho` });
            }
            cart.items.push({
                product: product._id,
                name: product.title,
                price: product.price,
                sale: product.sale ?? 0,
                image: product.images?.[0] ?? "",
                quantity,
                points: product.points ?? 0,
            });
        }

        await cart.save();
        return res.json({ message: "Đã thêm vào giỏ hàng", data: cart });
    } catch {
        return res.status(500).json({ message: "Lỗi khi thêm vào giỏ hàng" });
    }
};

// ──────────────────────────────────────────────
// PUT /cart/items/:productId  — Cập nhật số lượng
// Body: { quantity }
// ──────────────────────────────────────────────
export const updateCartItem = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body as { quantity?: number };

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "productId không hợp lệ" });
        }
        if (typeof quantity !== "number" || quantity < 1) {
            return res.status(400).json({ message: "Số lượng phải >= 1" });
        }

        const cart = await CartModel.findOne({ user: req.user!.uid });
        if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

        const item = cart.items.find((i) => i.product.toString() === productId);
        if (!item)
            return res
                .status(404)
                .json({ message: "Sản phẩm không có trong giỏ hàng" });

        const product = await ProductModel.findById(productId).select("stock");
        if (product && product.stock > 0 && quantity > product.stock) {
            return res
                .status(400)
                .json({ message: `Chỉ còn ${product.stock} sản phẩm trong kho` });
        }

        item.quantity = quantity;
        await cart.save();
        return res.json({ message: "Đã cập nhật số lượng", data: cart });
    } catch {
        return res.status(500).json({ message: "Lỗi khi cập nhật giỏ hàng" });
    }
};

// ──────────────────────────────────────────────
// DELETE /cart/items/:productId  — Xoá 1 sản phẩm
// ──────────────────────────────────────────────
export const removeCartItem = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "productId không hợp lệ" });
        }

        const cart = await CartModel.findOne({ user: req.user!.uid });
        if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

        const before = cart.items.length;
        cart.items = cart.items.filter(
            (i) => i.product.toString() !== productId
        ) as typeof cart.items;

        if (cart.items.length === before) {
            return res
                .status(404)
                .json({ message: "Sản phẩm không có trong giỏ hàng" });
        }

        await cart.save();
        return res.json({ message: "Đã xoá sản phẩm khỏi giỏ hàng", data: cart });
    } catch {
        return res.status(500).json({ message: "Lỗi khi xoá sản phẩm" });
    }
};

// ──────────────────────────────────────────────
// DELETE /cart  — Xoá toàn bộ giỏ hàng
// ──────────────────────────────────────────────
export const clearCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        await CartModel.findOneAndDelete({ user: req.user!.uid });
        return res.json({ message: "Đã xoá giỏ hàng" });
    } catch {
        return res.status(500).json({ message: "Lỗi khi xoá giỏ hàng" });
    }
};

// ──────────────────────────────────────────────
// POST /cart/checkout  — Tạo đơn hàng từ giỏ
// Body: { shippingAddress, paymentMethod }
// ──────────────────────────────────────────────
export const checkoutCart = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { shippingAddress, paymentMethod } = req.body as {
            shippingAddress?: {
                fullName: string;
                phone: string;
                address: string;
                email: string;
            };
            paymentMethod?: string;
        };

        const validPaymentMethods = [
            "COD",
            "BANK_TRANSFER",
            "MOMO",
            "VNPAY",
            "ZALOPAY",
            "PAYPAL",
        ];

        if (
            !shippingAddress?.fullName ||
            !shippingAddress?.phone ||
            !shippingAddress?.address ||
            !shippingAddress?.email
        ) {
            return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
        }
        if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
            return res
                .status(400)
                .json({ message: "Phương thức thanh toán không hợp lệ" });
        }

        const cart = await CartModel.findOne({ user: req.user!.uid }).session(
            session
        );
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng đang trống" });
        }

        let totalPrice = 0;
        const orderItems: {
            product: mongoose.Types.ObjectId;
            name: string;
            price: number;
            quantity: number;
            image: string;
            points: number;
        }[] = [];

        for (const item of cart.items) {
            const product = await ProductModel.findById(item.product).session(
                session
            );
            if (!product || product.isDeleted) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Sản phẩm "${item.name}" không còn tồn tại`,
                });
            }
            if (product.stock > 0 && item.quantity > product.stock) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Sản phẩm "${item.name}" chỉ còn ${product.stock} trong kho`,
                });
            }

            const effectivePrice =
                product.sale > 0
                    ? Math.round(product.price * (1 - product.sale / 100))
                    : product.price;

            orderItems.push({
                product: product._id,
                name: product.title,
                price: effectivePrice,
                quantity: item.quantity,
                image: product.images?.[0] ?? "",
                points: product.points ?? 0,
            });

            totalPrice += effectivePrice * item.quantity;

            // Trừ kho
            if (product.stock > 0) {
                await ProductModel.findByIdAndUpdate(
                    product._id,
                    { $inc: { stock: -item.quantity } },
                    { session }
                );
            }
        }

        const [order] = await Order.create(
            [
                {
                    user: req.user!.uid,
                    items: orderItems,
                    shippingAddress,
                    totalPrice,
                    paymentMethod,
                },
            ],
            { session }
        );

        // Xoá giỏ hàng sau khi đặt thành công
        await CartModel.findOneAndDelete({ user: req.user!.uid }, { session });

        await session.commitTransaction();
        return res.status(201).json({ message: "Đặt hàng thành công", data: order });
    } catch (err) {
        await session.abortTransaction();
        console.error("[CHECKOUT_ERROR]", err);
        return res.status(500).json({ message: "Lỗi khi đặt hàng" });
    } finally {
        session.endSession();
    }
};
