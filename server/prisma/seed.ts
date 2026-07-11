import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 创建管理员
  const hashedPw = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPw },
  });

  // 创建分类
  const categories = [
    { name: '招牌热菜', sort: 1 },
    { name: '爽口凉菜', sort: 2 },
    { name: '主食面点', sort: 3 },
    { name: '汤品煲类', sort: 4 },
    { name: '饮品甜点', sort: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const catMap: Record<string, number> = {};
  const allCats = await prisma.category.findMany();
  allCats.forEach((c) => (catMap[c.name] = c.id));

  // 创建菜品
  const dishes = [
    { name: '宫保鸡丁', price: 32, emoji: '🍗', spicyLevel: 2, category: '招牌热菜', description: '花生与鸡丁的经典搭配，麻辣鲜香' },
    { name: '鱼香肉丝', price: 28, emoji: '🥩', spicyLevel: 1, category: '招牌热菜', description: '酸甜微辣，下饭利器' },
    { name: '麻婆豆腐', price: 22, emoji: '🧈', spicyLevel: 3, category: '招牌热菜', description: '麻辣烫香，嫩滑入味' },
    { name: '糖醋里脊', price: 38, emoji: '🍖', spicyLevel: 0, category: '招牌热菜', description: '外酥里嫩，酸甜可口' },
    { name: '拍黄瓜', price: 12, emoji: '🥒', spicyLevel: 1, category: '爽口凉菜', description: '蒜香清脆，夏日首选' },
    { name: '口水鸡', price: 35, emoji: '🐔', spicyLevel: 3, category: '爽口凉菜', description: '红油飘香，麻辣鲜嫩' },
    { name: '蛋炒饭', price: 15, emoji: '🍚', spicyLevel: 0, category: '主食面点', description: '粒粒分明，家常味道' },
    { name: '手工水饺', price: 25, emoji: '🥟', spicyLevel: 0, category: '主食面点', description: '皮薄馅大，蘸醋更香' },
    { name: '番茄蛋花汤', price: 16, emoji: '🍅', spicyLevel: 0, category: '汤品煲类', description: '酸甜开胃，暖心暖胃' },
    { name: '酸辣汤', price: 18, emoji: '🥣', spicyLevel: 2, category: '汤品煲类', description: '胡椒浓郁，酸辣过瘾' },
    { name: '冰镇酸梅汤', price: 10, emoji: '🍹', spicyLevel: 0, category: '饮品甜点', description: '生津止渴，古法熬制' },
    { name: '芒果布丁', price: 14, emoji: '🍮', spicyLevel: 0, category: '饮品甜点', description: '细腻丝滑，饭后甜品' },
  ];

  for (const d of dishes) {
    await prisma.dish.create({
      data: {
        name: d.name,
        price: d.price,
        emoji: d.emoji,
        spicyLevel: d.spicyLevel,
        description: d.description,
        categoryId: catMap[d.category],
        isRecommended: d.price > 25,
      },
    });
  }

  // 创建桌台
  const tables = [
    { number: 'A1', capacity: 2 },
    { number: 'A2', capacity: 2 },
    { number: 'A3', capacity: 4 },
    { number: 'B1', capacity: 4 },
    { number: 'B2', capacity: 4 },
    { number: 'B3', capacity: 6 },
    { number: 'C1', capacity: 6 },
    { number: 'C2', capacity: 8 },
  ];

  for (const t of tables) {
    await prisma.table.upsert({
      where: { number: t.number },
      update: {},
      create: t,
    });
  }

  console.log('Seed 完成：1 管理员 + 5 分类 + 12 菜品 + 8 桌台');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
