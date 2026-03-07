// src/types/express.d.ts
import { JWTPayload } from "../services/auth";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export { };
