import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCategories, fetchDishes } from '../../api/endpoints';
import { useCartStore } from '../../stores/cartStore';
import type { Category, Dish } from '../../types';
import DishCard from '../../components/DishCard';
import CartDrawer from '../../components/CartDrawer';
import AIRecommend from '../../components/AIRecommend';

export default function MenuPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const setTable = useCartStore((s) => s.setTable);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0);

  useEffect(() => {
    if (tableId) setTable(Number(tableId));
    Promise.all([fetchCategories(), fetchDishes()])
      .then(([cats, d]) => {
        setCategories(cats);
        setDishes(d);
        if (cats.length > 0) setActiveCat(cats[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tableId]);

  const filteredDishes = activeCat ? dishes.filter((d) => d.categoryId === activeCat && d.isAvailable) : [];

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 40, textAlign: 'center', color: '#999' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fff', paddingBottom: 70 }}>
      {/* 顶部 */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '12px 16px',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18 }}>🍽️ 扫码点餐</div>
        <div style={{ fontSize: 12, color: '#999' }}>桌号: {tableId}</div>
      </div>

      {/* 分类标签 */}
      <div
        style={{
          display: 'flex',
          overflow: 'auto',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid #f5f5f5',
        }}
      >
        <button
          onClick={() => setActiveCat(null)}
          style={{
            padding: '6px 16px',
            borderRadius: 20,
            border: activeCat === null ? '2px solid #1677ff' : '1px solid #e8e8e8',
            background: activeCat === null ? '#e6f4ff' : '#fff',
            color: activeCat === null ? '#1677ff' : '#666',
            fontSize: 13,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            fontWeight: activeCat === null ? 600 : 400,
          }}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: activeCat === cat.id ? '2px solid #1677ff' : '1px solid #e8e8e8',
              background: activeCat === cat.id ? '#e6f4ff' : '#fff',
              color: activeCat === cat.id ? '#1677ff' : '#666',
              fontSize: 13,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              fontWeight: activeCat === cat.id ? 600 : 400,
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 菜品列表 */}
      <div style={{ padding: '0 16px' }}>
        <AIRecommend dishes={dishes} />
        {filteredDishes.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>该分类暂无菜品</div>
        )}
        {filteredDishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} onAdd={() => addItem(dish)} />
        ))}
      </div>

      {/* 底部购物车栏 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 480,
          margin: '0 auto',
          background: '#1a1a1a',
          color: '#fff',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: 100,
        }}
        onClick={() => setCartOpen(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🛒</span>
          {totalCount > 0 && (
            <span
              style={{
                background: '#ff4d4f',
                color: '#fff',
                fontSize: 11,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: -4,
              }}
            >
              {totalCount}
            </span>
          )}
        </div>
        <div style={{ flex: 1, marginLeft: 12 }}>
          <span style={{ opacity: 0.6 }}>
            {totalCount === 0 ? '点击查看购物车' : `共 ${totalCount} 件`}
          </span>
        </div>
        <span style={{ fontWeight: 600 }}>
          ¥{totalPrice}
        </span>
      </div>

      <CartDrawer visible={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
