import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'qr-order-secret-key-2026';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// 登录
authRouter.post('/login', validate(loginSchema), async (req, res) => {
  const { username, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return res.status(401).json({ error: '用户名或密码错误' });

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: '用户名或密码错误' });

  const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username: admin.username });
});

// 验证 token 是否有效
authRouter.get('/verify', authMiddleware, async (req: AuthRequest, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
  res.json({ valid: true, username: admin?.username });
});
