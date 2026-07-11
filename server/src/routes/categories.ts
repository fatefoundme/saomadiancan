import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const categoriesRouter = Router();

// 获取所有分类（含菜品数量）
categoriesRouter.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { sort: 'asc' },
    include: { _count: { select: { dishes: true } } },
  });
  res.json(categories);
});

const categorySchema = z.object({
  name: z.string().min(1, '分类名不能为空'),
  sort: z.number().int().optional(),
});

// 新增分类
categoriesRouter.post('/', authMiddleware, validate(categorySchema), async (req, res) => {
  const cat = await prisma.category.create({ data: req.body });
  res.status(201).json(cat);
});

// 编辑分类
categoriesRouter.put('/:id', authMiddleware, validate(categorySchema), async (req, res) => {
  const cat = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(cat);
});

// 删除分类
categoriesRouter.delete('/:id', authMiddleware, async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});
