import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import mongoose from 'mongoose';
import User from '../models/userModel';

export async function getUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const currentUserId = req.user?.uid

    if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const limit = 10;

    const rawPage = Number(req.query.page) || 1;
    const page = Math.max(rawPage, 1);

    const matchStage = {}

    const total = await User.countDocuments(matchStage);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const users = await User.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          isActive: {
            $eq: ['$_id', new mongoose.Types.ObjectId(currentUserId)]
          }
        }
      },
      {
        $sort: {
          isActive: -1,      // active lên đầu
          createdAt: -1      // sau đó sort theo ngày tạo
        }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          phone: 1,
          role: 1,
          createdAt: 1,
          updatedAt: 1,
          isActive: 1,
          isBlocked: 1,
          blockedAt: 1,
          isVerified: 1,
        }
      }
    ])

    res.json({
      data: users,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('getUsers error', error);
    res.status(500).json({ message: 'Không thể lấy danh sách user' });
  }
}

export async function getUserById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy user' });
  }
}

export async function editUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { fullName, phone, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = fullName ?? user.fullName;
    user.phone = phone ?? user.phone;
    user.role = role ?? user.role;

    await user.save();

    res.json({ message: "Cập nhật thành công User", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật user" });
  }
}

export async function blockUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.uid;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user cần block" });
    }

    // ❌ Không cho tự block mình
    if (String(user._id) === String(currentUserId)) {
      return res.status(400).json({ message: "Bạn không thể block chính mình" });
    }

    // ❌ Không cho block admin (optional)
    if (user.role === "admin") {
      return res.status(403).json({ message: "Không thể block ADMIN" });
    }

    user.isBlocked = !user.isBlocked;
    user.blockedAt = user.isBlocked ? new Date() : null;

    await user.save();

    res.json({
      message: user.isBlocked ? "Đã block" : "Gỡ block thành công",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi gỡ block" });
  }
}