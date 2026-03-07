import { Request } from 'express';
import { JWTPayload } from '../services/auth';

export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}