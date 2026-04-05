import crypto from 'crypto';
import { Request, Response } from 'express';
import UserModel from '../models/userModel';
import { sendResetPasswordMail } from '../utils/sendMail';
import { CLIENT_ORIGIN } from '../lib/config';

export async function forgotPassword(req: Request, res: Response) {
  const start = Date.now();
  const MIN_RESPONSE_TIME = 500;
  const WAIT_TIME = 5 * 60 * 1000; // 5 phút

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Thiếu email' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    if (
      user.resetPasswordRequestedAt &&
      Date.now() - user.resetPasswordRequestedAt.getTime() < WAIT_TIME
    ) {
      return res.status(429).json({
        message: 'Vui lòng đợi trước khi yêu cầu lại',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    user.resetPasswordRequestedAt = new Date();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetUrl = `${CLIENT_ORIGIN}/reset-password?token=${token}`;

    try {
      await sendResetPasswordMail(normalizedEmail, resetUrl);
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      throw err;
    }

    const elapsed = Date.now() - start;
    if (elapsed < MIN_RESPONSE_TIME) {
      await new Promise(r => setTimeout(r, MIN_RESPONSE_TIME - elapsed));
    }

    return res.json({
      message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu',
    });

  } catch (error) {
    console.error('Lỗi forgot password:', error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra, vui lòng thử lại sau',
    });
  }
}
