import OpenAI from 'openai';

interface DishInfo {
  id: number;
  name: string;
  price: number;
  description: string | null;
  spicyLevel: number;
  category: { name: string };
}

interface RecommendationResult {
  dishId: number;
  reason: string;
}

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

export async function getRecommendations(
  allDishes: DishInfo[],
  cartDishes: DishInfo[],
  recentDishes: DishInfo[]
): Promise<RecommendationResult[]> {
  const menuSummary = allDishes
    .filter((d) => !cartDishes.find((c) => c.id === d.id))
    .map((d) => ({
      id: d.id,
      name: d.name,
      price: d.price,
      category: d.category.name,
      spicyLevel: d.spicyLevel,
      desc: d.description || '',
    }));

  const cartSummary = cartDishes.map((d) => d.name);
  const recentSummary = recentDishes.map((d) => d.name);

  const prompt = `你是餐厅的智能推荐助手。根据用户已点的菜品，从菜单中推荐3道用户可能喜欢的菜。

已点菜品：${cartSummary.length ? cartSummary.join('、') : '（尚未点菜）'}
历史偏好：${recentSummary.length ? recentSummary.join('、') : '（无历史记录）'}
完整菜单：${JSON.stringify(menuSummary)}

请返回JSON数组，每项包含 dishId 和 reason：
[{"dishId": 数字, "reason": "推荐理由（15字以内，要有说服力）"}]

只返回JSON数组，不要其他内容。`;

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    });

    const text = response.choices[0]?.message?.content?.trim() || '[]';
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const result: RecommendationResult[] = JSON.parse(jsonStr);

    // 验证返回的 dishId 有效
    return result.filter((r) => allDishes.some((d) => d.id === r.dishId)).slice(0, 3);
  } catch (error) {
    console.error('AI 推荐失败:', error);
    // 降级：随机推荐热门菜
    return allDishes
      .filter((d) => !cartDishes.find((c) => c.id === d.id))
      .filter((d) => d.spicyLevel <= 2)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((d) => ({ dishId: d.id, reason: '人气推荐，试试看吧' }));
  }
}
