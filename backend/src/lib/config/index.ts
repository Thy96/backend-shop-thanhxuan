import type { SignOptions } from 'jsonwebtoken';

type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y';
type TtlString = `${number}${TimeUnit}`;

function parseTtl(raw?: string): SignOptions['expiresIn'] {
  if (!raw || raw.trim() === '') return '7d';                // default

  const s = raw.trim();

  // Nếu chỉ là số -> hiểu là giây
  if (/^\d+$/.test(s)) return Number(s);

  // Nếu là chuỗi có hậu tố thời gian hợp lệ -> ép kiểu về StringValue
  // Hậu tố hợp lệ: ms | s | m | h | d | w | y (đúng theo jsonwebtoken)
  if (/^\d+\s*(ms|s|m|h|d|w|y)$/i.test(s)) {
    return s.replace(/\s+/g, '') as TtlString;            // bỏ khoảng trắng nếu có
  }

  // Không hợp lệ -> fallback an toàn
  return '7d';
}

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const isProd = NODE_ENV === 'production';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
export const TOKEN_TTL: SignOptions['expiresIn'] = parseTtl(process.env.TOKEN_TTL);
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || process.env.CLIENT_ORIGIN_LOCAL;
export const COOKIE_NAME = process.env.COOKIE_NAME || 'access_token';