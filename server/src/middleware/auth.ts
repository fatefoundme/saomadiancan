import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'qr-order-secret-key-2026';

export interface AuthRequest extends Request {
  adminId?: number;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: '请先登录' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number };
    req.adminId = payload.id;
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期' });
  }
}
