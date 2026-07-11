import type { Dish } from '../types';
import { useCartStore } from '../stores/cartStore';

interface Props {
  dish: Dish;
  onAdd: () => void;
}

export default function DishCard({ dish, onAdd }: Props) {
  const items = useCartStore((s) => s.items);
  const cartItem = items.find((i) => i.dish.id === dish.id);

  return (
    <div
      onClick={onAdd}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f5f5f5',
        cursor: 'pointer',
        gap: 12,
      }}
    >
      {dish.image ? (
        <img src={dish.image} alt={dish.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <span style={{ fontSize: 40 }}>{dish.emoji}</span>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{dish.name}</span>
          {dish.isRecommended && (
            <span style={{ background: '#ff4d4f', color: '#fff', fontSize: 10, padding: '1px 4px', borderRadius: 2 }}>
              推荐
            </span>
          )}
          {dish.spicyLevel > 0 && (
            <span style={{ fontSize: 12 }}>
              {Array.from({ length: dish.spicyLevel }, () => '🌶️').join('')}
            </span>
          )}
        </div>
        {dish.description && (
          <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{dish.description}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: 16 }}>¥{dish.price}</span>
          {cartItem && (
            <span style={{ background: '#1677ff', color: '#fff', fontSize: 11, padding: '1px 6px', borderRadius: 10 }}>
              ×{cartItem.quantity}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
