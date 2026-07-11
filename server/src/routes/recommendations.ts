import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { getRecommendations } from '../services/ai.js';

export const recommendationsRouter = Router();

const schema = z.object({
  cartDishIds: z.array(z.number().int()).optional(),
  tableId: z.number().int().optional(),
});

// AI 菜品推荐
recommendationsRouter.post('/', validate(schema), async (req, res) => {
  const { cartDishIds, tableId } = req.body;

  // 收集上下文
  const allDishes = await prisma.dish.findMany({
    where: { isAvailable: true },
    include: { category: true },
  });

  const cartDishes = cartDishIds?.length
    ? allDishes.filter((d) => cartDishIds.includes(d.id))
    : [];

  // 获取该桌台近期订单作为偏好信号
  let recentDishes: typeof allDishes = [];
  if (tableId) {
    const recentOrders = await prisma.order.findMany({
      where: { tableId },
      include: { items: { include: { dish: true } } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    const recentIds = new Set(
      recentOrders.flatMap((o) => o.items.map((i) => i.dishId))
    );
    recentDishes = allDishes.filter((d) => recentIds.has(d.id));
  }

  const recommendations = await getRecommendations(allDishes, cartDishes, recentDishes);
  res.json({ recommendations });
});
