import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import type { Secret, JwtPayload } from 'jsonwebtoken';
import { COOKIE_NAME, JWT_SECRET } from '../lib/config';
import { JWTPayload, Role } from '../services/auth';
import { AuthenticatedRequest } from '../types/auth';
import UserModel from '../models/userModel';

// throttle cập nhật lastSeenAt: mỗi user tối đa 1 lần / 30 giây
const lastSeenCache = new Map<string, number>();
const LAST_SEEN_THROTTLE = 30_000;

function updateLastSeen(uid: string) {
  const now = Date.now();
  if ((lastSeenCache.get(uid) ?? 0) + LAST_SEEN_THROTTLE > now) return;
  lastSeenCache.set(uid, now);
  UserModel.findByIdAndUpdate(uid, { lastSeenAt: new Date(now) }).catch(() => { });
}

function getTokenFromReq(req: Request): string | undefined {
  const auth = req.headers.authorization;
  const bearer = auth && auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
  // dùng COOKIE_NAME thay vì 'token' cứng
  const cookieToken = (req as any).cookies?.[COOKIE_NAME];
  return bearer || cookieToken;
}

function isAppPayload(p: unknown): p is JWTPayload {
  if (!p || typeof p !== 'object') return false;

  const obj = p as Partial<JWTPayload>;

  return (
    typeof obj.uid === 'string' &&
    typeof obj.tokenVersion === 'number' &&
    (['admin', 'editor', 'user'] as Role[]).includes(obj.role as Role)
  );
}

// authenticate, authorize (req,res,next)
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Lấy token chuẩn từ header/cookie
  const token = getTokenFromReq(req)
  // console.log('Authorization header:', req.headers.authorization);
  // console.log('Cookie header:', req.headers.cookie);
  // console.log('Token from req =', token);
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });

  try {
    const secret: Secret = JWT_SECRET as Secret;
    const decoded = jwt.verify(token, secret);

    if (!isAppPayload(decoded)) return res.status(401).json({ message: 'Token không hợp lệ' });

    const user = await UserModel.findById(decoded.uid);
    // console.log('DECODED TOKEN =', decoded);

    if (!user) {
      return res.status(401).json({ message: 'User không tồn tại' });
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Token đã bị vô hiệu hóa' });
    }

    req.user = decoded;
    updateLastSeen(decoded.uid);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}

export function authorize(...roles: JWTPayload['role'][]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Không đủ quyền' });
    next();
  };
}
