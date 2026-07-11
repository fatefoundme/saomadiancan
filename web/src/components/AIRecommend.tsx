import { useState, useEffect } from 'react';
import { fetchRecommendations } from '../api/endpoints';
import { useCartStore } from '../stores/cartStore';
import type { Recommendation, Dish } from '../types';

interface Props {
  dishes: Dish[];
}

export default function AIRecommend({ dishes }: Props) {
  const cartItems = useCartStore((s) => s.items);
  const tableId = useCartStore((s) => s.tableId);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const loadRecs = async () => {
    setLoading(true);
    try {
      const data = await fetchRecommendations({
        cartDishIds: cartItems.map((i) => i.dish.id),
        tableId: tableId ?? undefined,
      });
      setRecs(data.recommendations);
      setShow(true);
    } catch {
      // 降级推荐
      const random = dishes
        .filter((d) => !cartItems.find((c) => c.dish.id === d.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((d) => ({ dishId: d.id, reason: '人气推荐，试试看吧' }));
      setRecs(random);
      setShow(true);
    }
    setLoading(false);
  };

  if (!show) {
    return (
      <div style={{ padding: '12px 0', textAlign: 'center' }}>
        <button
          onClick={loadRecs}
          disabled={loading}
          style={{
            padding: '8px 24px',
            borderRadius: 20,
            border: '2px solid #1677ff',
            background: '#fff',
            color: '#1677ff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? 'AI 正在思考...' : '🤖 AI 帮我推荐'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🤖</span> AI 为你推荐
        <button
          onClick={() => setShow(false)}
          style={{ marginLeft: 'auto', border: 'none', background: 'none', color: '#999', cursor: 'pointer', fontSize: 12 }}
        >
          收起
        </button>
      </div>
      {recs.map((rec) => {
        const dish = dishes.find((d) => d.id === rec.dishId);
        if (!dish) return null;
        return (
          <div
            key={rec.dishId}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 28 }}>{dish.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{dish.name}</div>
              <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 2 }}>"{rec.reason}"</div>
            </div>
            <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{dish.price}</span>
          </div>
        );
      })}
    </div>
  );
}
