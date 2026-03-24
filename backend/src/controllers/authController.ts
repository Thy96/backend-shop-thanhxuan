import crypto from 'crypto';
import { Request, Response } from 'express';
import { signToken } from '../services/auth';
import { AuthenticatedRequest } from '../types/auth';
import { COOKIE_NAME, isProd, TOKEN_TTL } from '../lib/config';
import User, { Role } from '../models/userModel';
import { sendVerifyEmailMail } from '../utils/sendMail';

export async function login(req: Request, res: Response) {
  // console.log('LOGIN BODY', req.body);
  const { email, password } = req.body || {};
  const errors: Record<string, string> = {};
  const emailNormalized = String(email).trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!emailRegex.test(emailNormalized)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const user = await User.findOne({ email: emailNormalized }).select('+passwordHash');

  if (!user) {
    return res.status(401).json({
      errors: {
        email: 'Email không tồn tại',
      },
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      message: 'Vui lòng xác thực email trước khi đăng nhập',
    });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: "Tài khoản của bạn hiện đang tạm khóa" });
  }

  if (user.role === Role.USER) {
    return res.status(403).json({ message: 'Không có quyền truy cập admin' });
  }

  // 3️⃣ Check password
  const isValid = await user.verifyPassword(password);
  if (!isValid) {
    return res.status(401).json({
      errors: {
        password: 'Mật khẩu không đúng',
      },
    });
  }

  const token = signToken({ uid: user.id, role: user.role, tokenVersion: user.tokenVersion, }, TOKEN_TTL);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    // secure: isProd,
    // sameSite: isProd ? 'none' : 'lax',
    secure: true,
    sameSite: "none",
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ message: 'Đăng nhập thành công', role: user.role, });
}

export async function logout(req: Request, res: Response) {
  // console.log('LOGOUT BODY', req.body);
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    // secure: isProd,
    // sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
  res.json({ message: 'Đã đăng xuất' });
}

export async function register(req: Request, res: Response) {
  try {
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const { email, password, fullName, phone, address, role } = req.body || {};
    const errors: Record<string, string> = {};

    const emailNormalized = String(email || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

    if (!emailRegex.test(emailNormalized)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (!passwordRegex.test(password)) {
      errors.password =
        'Mật khẩu tối thiểu 6 ký tự, có 1 chữ in hoa và 1 ký tự đặc biệt';
    }

    if (!fullName || !fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!phone) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^0\d{9}$/.test(phone)) {
      errors.phone = 'SDT không hợp lệ (10 số, bắt đầu bằng 0)';
    }

    if (!address || !address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // ✅ check email và phone tồn tại
    const exist = await User.findOne({ email: emailNormalized });
    if (exist) {
      return res.status(400).json({
        errors: { email: 'Email đã tồn tại' },
      });
    }

    const existPhone = await User.findOne({ phone: phone })
    if (existPhone) {
      return res.status(400).json({
        errors: { phone: 'Số điện thoại đã tồn tại' },
      });
    }

    // ✅ tạo user
    const allowedRoles = [Role.ADMIN, Role.EDITOR, Role.USER];
    const assignedRole = allowedRoles.includes(role) ? role : Role.USER;

    const user = new User({
      email: emailNormalized,
      fullName: fullName.trim(),
      phone,
      address: address.trim(),
      role: assignedRole,
      // ⭐ verify email
      verifyToken,
      verifyTokenExpires: new Date(Date.now() + 1000 * 60 * 60), // 1h
    });

    // ⭐ set password (model sẽ hash)
    await user.setPassword(password);

    await user.save();

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const verifyLink = `${backendUrl}/api/admin/auth/verify-email?token=${verifyToken}`;

    // ⭐ fire-and-forget: không chặn response khi gửi mail
    sendVerifyEmailMail(user.email, verifyLink).catch((err) => {
      console.error('Failed to send verify email:', err);
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Thiếu token' });
    }

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpires: { $gt: new Date() },
    }).select('+verifyToken +verifyTokenExpires');

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;

    await user.save();

    res.json({ message: 'Xác thực email thành công' });
  } catch (error) {
    console.error('verifyEmail error', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function resendVerify(req: Request, res: Response) {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy user' });
  }

  if (user.verifyTokenExpires && user.verifyTokenExpires > new Date(Date.now() + 55 * 60 * 1000)) {
    return res.status(400).json({ message: 'Vui lòng chờ trước khi gửi lại' });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: 'Email đã xác thực rồi' });
  }

  // tạo token mới
  const verifyToken = crypto.randomBytes(32).toString('hex');

  user.verifyToken = verifyToken;
  user.verifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60);

  await user.save();

  const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;

  await sendVerifyEmailMail(user.email, verifyLink);

  res.json({ message: 'Đã gửi lại email xác thực' });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ message: 'Chưa đăng nhập' });

  const USER_PUBLIC_FIELDS = '_id fullName email role createdAt phone';
  const u = await User.findById(uid)
    .select(USER_PUBLIC_FIELDS)
    .lean();
  if (!u) return res.status(404).json({ message: 'User không tồn tại' });

  res.json({ user: u });
}

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const { fullName, phone } = req.body;

    if (!fullName || fullName === '') {
      return res.status(400).json({ message: 'Yêu cầu nhập Full Name' });
    }

    if (!phone) {
      return res.status(400).json({ message: 'Yêu cầu nhập SDT' });
    }

    if (!/^0\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'SDT không hợp lệ (10 số, bắt đầu bằng 0)' });
    }

    const u = await User.findByIdAndUpdate(
      req.user?.uid,
      {
        fullName: fullName.trim(),
        phone: phone
      },
      { new: true, runValidators: true }
    ).select('_id fullName email role phone')

    if (!u) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: u?.id,
        email: u?.email,
        fullName: u?.fullName,
        role: u?.role,
        phone: u?.phone,
      }
    })
  } catch (error) {
    console.error('updateMe error', error)
    res.status(500).json({ message: 'Cập nhật thông tin thất bại' });
  }
}