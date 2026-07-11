import { useCartStore } from '../stores/cartStore';
import { useNavigate } from 'react-router-dom';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CartDrawer({ visible, onClose }: Props) {
  const { items, updateQuantity, totalPrice, totalCount } = useCartStore();
  const navigate = useNavigate();

  if (!visible) return null;

  const handleCheckout = () => {
    if (items.length === 0) return;
    onClose();
    navigate('/order-confirm');
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 998,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          zIndex: 999,
          maxHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>购物车 ({totalCount()})</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>购物车空空如也</div>
          ) : (
            items.map((item) => (
              <div
                key={item.dish.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #f5f5f5',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 30 }}>{item.dish.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{item.dish.name}</div>
                  <div style={{ color: '#ff4d4f', fontSize: 13 }}>¥{item.dish.price}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      border: '1px solid #d9d9d9',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: 16,
                      lineHeight: '26px',
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      border: '1px solid #1677ff',
                      background: '#1677ff',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 16,
                      lineHeight: '26px',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div
            style={{
              padding: 16,
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: 13, color: '#666' }}>合计 </span>
              <span style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 18 }}>¥{totalPrice()}</span>
            </div>
            <button
              onClick={handleCheckout}
              style={{
                padding: '10px 32px',
                borderRadius: 24,
                border: 'none',
                background: '#1677ff',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              去下单
            </button>
          </div>
        )}
      </div>
    </>
  );
}
