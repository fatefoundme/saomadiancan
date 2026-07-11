import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useOrderStore } from '../../stores/orderStore';
import { createOrder } from '../../api/endpoints';

export default function OrderConfirm() {
  const { items, tableId, totalPrice, clearCart } = useCartStore();
  const setCurrentOrder = useOrderStore((s) => s.setCurrentOrder);
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!tableId || items.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const order = await createOrder({
        tableId,
        items: items.map((i) => ({ dishId: i.dish.id, quantity: i.quantity })),
        remark,
      });
      setCurrentOrder(order);
      clearCart();
      navigate(`/payment/${order.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '下单失败';
      setError(msg || '下单失败，请重试');
    }
    setSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🛒</div>
        <div style={{ color: '#999', marginTop: 12 }}>购物车为空</div>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 20,
            padding: '10px 32px',
            borderRadius: 24,
            border: 'none',
            background: '#1677ff',
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          返回菜单
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' }}>
      <div
        style={{
          background: '#fff',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer' }}
        >
          ←
        </button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>确认订单</span>
      </div>

      <div style={{ padding: 16, background: '#fff', marginTop: 8 }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>桌号: {tableId}</div>
        {items.map((item) => (
          <div
            key={item.dish.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{item.dish.emoji}</span>
              <span style={{ fontSize: 14 }}>{item.dish.name}</span>
              <span style={{ fontSize: 12, color: '#999' }}>×{item.quantity}</span>
            </div>
            <span style={{ color: '#ff4d4f' }}>¥{item.dish.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: 16, background: '#fff', marginTop: 8 }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>备注</div>
        <input
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="如有特殊需求请备注..."
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e8e8e8',
            borderRadius: 8,
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {error && (
        <div style={{ padding: '8px 16px', color: '#ff4d4f', fontSize: 13 }}>{error}</div>
      )}

      <div style={{ padding: 16, marginTop: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background: submitting ? '#ccc' : '#1677ff',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? '提交中...' : `确认下单 ¥${totalPrice()}`}
        </button>
      </div>
    </div>
  );
}
