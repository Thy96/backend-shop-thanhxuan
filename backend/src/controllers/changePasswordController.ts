import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import User from '../models/userModel';
import { COOKIE_NAME } from '../lib/config';

export async function changePassword(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const errors: Record<string, string> = {};

    if (!currentPassword)
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!newPassword)
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    if (!confirmPassword)
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (newPassword && !strongPasswordRegex.test(newPassword)) {
      errors.newPassword =
        'Mật khẩu phải tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }

    const isValid = await user.verifyPassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({
        errors: { currentPassword: 'Mật khẩu hiện tại không đúng' },
      });
    }

    const isSame = await user.verifyPassword(newPassword);
    if (isSame) {
      return res.status(400).json({
        errors: { newPassword: 'Mật khẩu mới không được trùng mật khẩu cũ' },
      });
    }

    await user.setPassword(newPassword);

    // 🔥 invalidate refresh token nếu dùng tokenVersion
    user.tokenVersion += 1;

    await user.save();

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
}

