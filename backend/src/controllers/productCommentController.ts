import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductCommentModel from "../models/productCommentModel";

// GET /api/admin/products/:productId/comments
export const getCommentsByProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: "productId không hợp lệ" });
            return;
        }

        const rawPage = Number(req.query.page) || 1;
        const page = Math.max(rawPage, 1);
        const limit = Number(req.query.limit) || 10;

        const total = await ProductCommentModel.countDocuments({ productId });
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * limit;

        const comments = await ProductCommentModel.find({ productId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId", "fullName email")
            .lean();

        res.json({
            data: comments,
            pagination: {
                page: safePage,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error("[getCommentsByProduct] Error:", error);
        res.status(500).json({ message: "Lỗi server khi lấy bình luận" });
    }
};

// DELETE /api/admin/products/:productId/comments/:commentId
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            res.status(400).json({ message: "commentId không hợp lệ" });
            return;
        }

        const deleted = await ProductCommentModel.findByIdAndDelete(commentId);
        if (!deleted) {
            res.status(404).json({ message: "Không tìm thấy bình luận" });
            return;
        }

        res.json({ message: "Đã xóa bình luận thành công" });
    } catch (error) {
        console.error("[deleteComment] Error:", error);
        res.status(500).json({ message: "Lỗi server khi xóa bình luận" });
    }
};

// POST /api/admin/products/:productId/comments  (dùng cho phía khách hàng gửi bình luận)
export const createComment = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: "productId không hợp lệ" });
            return;
        }

        const { userId, content, rating } = req.body;

        if (!userId || !content) {
            res.status(400).json({ message: "userId và content là bắt buộc" });
            return;
        }

        const comment = await ProductCommentModel.create({
            productId,
            userId,
            content: String(content).trim(),
            rating: Number(rating) || 5,
        });

        const populated = await comment.populate("userId", "fullName email");

        res.status(201).json(populated);
    } catch (error) {
        console.error("[createComment] Error:", error);
        res.status(500).json({ message: "Lỗi server khi thêm bình luận" });
    }
};
