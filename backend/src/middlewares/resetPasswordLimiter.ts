import rateLimit from 'express-rate-limit';

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // tối đa 5 lần
  message: {
    message: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});