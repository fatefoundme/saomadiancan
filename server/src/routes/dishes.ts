import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const dishesRouter = Router();

// 获取菜品列表（支持分类筛选 & 关键词搜索）
dishesRouter.get('/', async (req, res) => {
  const { categoryId, kw } = req.query;
  const where: Record<string, unknown> = { isAvailable: true };
  if (categoryId) where.categoryId = Number(categoryId);
  if (kw) where.name = { contains: String(kw) };

  const dishes = await prisma.dish.findMany({
    where,
    include: { category: true },
    orderBy: [{ isRecommended: 'desc' }, { categoryId: 'asc' }, { name: 'asc' }],
  });
  res.json(dishes);
});

const dishSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  image: z.string().optional(),
  spicyLevel: z.number().int().min(0).max(3).optional(),
  isRecommended: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.number().int(),
});

// 新增菜品
dishesRouter.post('/', authMiddleware, validate(dishSchema), async (req, res) => {
  const dish = await prisma.dish.create({ data: req.body });
  res.status(201).json(dish);
});

// 编辑菜品
dishesRouter.put('/:id', authMiddleware, validate(dishSchema), async (req, res) => {
  const dish = await prisma.dish.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(dish);
});

// 删除菜品
dishesRouter.delete('/:id', authMiddleware, async (req, res) => {
  await prisma.dish.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});
