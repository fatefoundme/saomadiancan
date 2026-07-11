import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getIO } from '../lib/socket.js';

export const ordersRouter = Router();

const orderItemSchema = z.object({
  dishId: z.number().int(),
  quantity: z.number().int().min(1),
});

const createOrderSchema = z.object({
  tableId: z.number().int(),
  remark: z.string().optional(),
  items: z.array(orderItemSchema).min(1, '请至少点一个菜'),
});

// 下单
ordersRouter.post('/', validate(createOrderSchema), async (req, res) => {
  const { tableId, remark, items } = req.body;

  // 校验桌台存在
  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) return res.status(400).json({ error: '桌台不存在' });

  // 获取所有菜品信息并计算总价
  const dishIds = items.map((i: { dishId: number }) => i.dishId);
  const dishes = await prisma.dish.findMany({ where: { id: { in: dishIds } } });
  const dishMap = new Map(dishes.map((d) => [d.id, d]));

  let totalPrice = 0;
  const orderItems = items.map((item: { dishId: number; quantity: number }) => {
    const dish = dishMap.get(item.dishId);
    if (!dish) throw new Error(`菜品 ${item.dishId} 不存在`);
    if (!dish.isAvailable) throw new Error(`${dish.name} 已下架`);
    const subtotal = dish.price * item.quantity;
    totalPrice += subtotal;
    return { dishId: item.dishId, quantity: item.quantity, price: dish.price };
  });

  // 生成订单号
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = (await prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } })) + 1;
  const orderNo = `D${dateStr}${String(count).padStart(3, '0')}`;

  const order = await prisma.order.create({
    data: {
      orderNo,
      tableId,
      totalPrice: Math.round(totalPrice * 100) / 100,
      remark,
      items: { create: orderItems },
    },
    include: { items: { include: { dish: true } }, table: true },
  });

  // 更新桌台状态
  await prisma.table.update({ where: { id: tableId }, data: { status: 'occupied' } });

  // 广播新订单到后厨
  getIO().to('kitchen').emit('order:new', order);

  res.status(201).json(order);
});

// 查询订单列表（后台用，支持状态筛选）
ordersRouter.get('/', async (req, res) => {
  const { status, tableId } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (tableId) where.tableId = Number(tableId);

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { dish: true } }, table: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(orders);
});

// 获取单个订单
ordersRouter.get('/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: { items: { include: { dish: true } }, table: true },
  });
  if (!order) return res.status(404).json({ error: '订单不存在' });
  res.json(order);
});

const statusSchema = z.object({
  status: z.enum(['pending', 'paid', 'cooking', 'ready', 'served']),
});

// 更新订单状态
ordersRouter.patch('/:id/status', authMiddleware, validate(statusSchema), async (req, res) => {
  const id = Number(req.params.id);
  const order = await prisma.order.update({
    where: { id },
    data: { status: req.body.status },
    include: { items: { include: { dish: true } }, table: true },
  });

  // 如果订单完成，释放桌台
  if (req.body.status === 'served') {
    const activeOrders = await prisma.order.count({
      where: { tableId: order.tableId, status: { notIn: ['served', 'paid'] } },
    });
    if (activeOrders === 0) {
      await prisma.table.update({ where: { id: order.tableId }, data: { status: 'available' } });
    }
  }

  // 通知顾客端状态变更
  getIO().to(`order:${id}`).emit('order:status-update', order);
  // 通知后厨端
  getIO().to('kitchen').emit('order:status-update', order);

  res.json(order);
});

// 仿真支付
const paySchema = z.object({
  paymentMethod: z.enum(['wechat', 'alipay']),
});

ordersRouter.post('/:id/pay', validate(paySchema), async (req, res) => {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.status !== 'pending') return res.status(400).json({ error: '订单状态不允许支付' });

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: 'paid',
      paymentMethod: req.body.paymentMethod,
      paidAt: new Date(),
    },
    include: { items: { include: { dish: true } }, table: true },
  });

  getIO().to(`order:${id}`).emit('order:status-update', updated);
  getIO().to('kitchen').emit('order:status-update', updated);

  res.json(updated);
});
