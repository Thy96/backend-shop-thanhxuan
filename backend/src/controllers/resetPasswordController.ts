import crypto from 'crypto';
import { Request, Response } from 'express';
import UserModel from '../models/userModel';

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!token || !password) {
      return res.status(400).json({ message: 'Thiếu dữ liệu' });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Mật khẩu phải tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    await user.setPassword(password);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}