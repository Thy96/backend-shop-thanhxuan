import { NextFunction, Response } from 'express';
import VisitModel from '../models/visitModel';
import { AuthenticatedRequest } from '../types/auth';

// cache lưu thời điểm visit gần nhất
const visitCache = new Map<string, number>();
// throttle 5s
const THROTTLE_TIME = 5000;

// middleware
export const trackVisit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction) => {
  try {
    if (req.method !== 'GET') return next();
    if (req.originalUrl.startsWith('/api')) return next();

    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';

    const key = `${ip}_${req.originalUrl}`;
    const now = Date.now();

    const lastVisit = visitCache.get(key);

    // ⭐ nếu visit lại trong 5s → bỏ qua
    if (lastVisit && now - lastVisit < THROTTLE_TIME) {
      return next();
    }

    // ⭐ cập nhật cache
    visitCache.set(key, now);

    await VisitModel.create({
      ip,
      userAgent: req.headers['user-agent'],
      path: req.originalUrl,
      userId: req.user?.uid || undefined, // nếu có auth middleware
    });
  } catch (error) {
    console.error('Visit tracking error:', error);
  }

  next();
};