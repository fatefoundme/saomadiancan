import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const tablesRouter = Router();

// 获取所有桌台
tablesRouter.get('/', async (_req, res) => {
  const tables = await prisma.table.findMany({ orderBy: { number: 'asc' } });
  res.json(tables);
});

// 获取单个桌台（含进行中的订单）
tablesRouter.get('/:id', async (req, res) => {
  const table = await prisma.table.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      orders: {
        where: { status: { notIn: ['served', 'paid'] } },
        include: { items: { include: { dish: true } } },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });
  if (!table) return res.status(404).json({ error: '桌台不存在' });
  res.json(table);
});
