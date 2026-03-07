import * as jwt from 'jsonwebtoken';
import type { SignOptions, Secret } from 'jsonwebtoken';
import { JWT_SECRET } from '../lib/config';

export type Role = 'admin' | 'editor' | 'user';
export type JWTPayload = { uid: string; role: Role; tokenVersion: number; };

// signToken, helpers JWT thuần
export function signToken(payload: JWTPayload, ttl: SignOptions['expiresIn'] = '7d') {
  const secret: Secret = JWT_SECRET as Secret;
  const options: SignOptions = { expiresIn: ttl };
  return jwt.sign(payload, secret, options);
}