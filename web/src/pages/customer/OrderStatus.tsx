import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrder } from '../../api/endpoints';
import { getSocket } from '../../socket';
import { useOrderStore } from '../../stores/orderStore';
import { ORDER_STATUS_MAP } from '../../types';
import type { Order, OrderStatus as OrderStatusType } from '../../types';

const STATUS_STEPS: OrderStatusType[] = ['pending', 'paid', 'cooking', 'ready', 'served'];

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const [order, setOrder] = useState<Order | null>(useOrderStore.getState().currentOrder);
  const [loading, setLoading] = useState(!order);
  const navigate = useNavigate();

  useEffect(() => {
    if (!order) {
      fetchOrder(orderId)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }

    const socket = getSocket();
    socket.emit('join:order', orderId);
    socket.on('order:status-update', (updated: Order) => {
      if (updated.id === orderId) setOrder(updated);
    });

    return () => {
      socket.off('order:status-update');
    };
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 60, textAlign: 'center', color: '#999' }}>
        加载中...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 60, textAlign: 'center' }}>
        <div style={{ color: '#999' }}>订单不存在</div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);

  const statusIcon = (s: OrderStatusType) => {
    const map: Record<OrderStatusType, string> = {
      pending: '📋', paid: '💰', cooking: '👨‍🍳', ready: '✅', served: '🍽️',
    };
    return map[s] || '📋';
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' }}>
      <div
        style={{
          background: order.status === 'pending' ? '#fa8c16' : '#1677ff',
          color: '#fff',
          padding: '30px 16px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>{statusIcon(order.status)}</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{ORDER_STATUS_MAP[order.status]}</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>订单号: {order.orderNo}</div>
      </div>

      {/* 待支付提示 */}
      {order.status === 'pending' && (
        <div style={{ padding: 16, background: '#fff', marginTop: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#fa8c16', marginBottom: 12 }}>
            订单已提交，请先完成支付
          </div>
          <button
            onClick={() => navigate(`/payment/${orderId}`)}
            style={{
              padding: '12px 48px',
              borderRadius: 24,
              border: 'none',
              background: '#fa8c16',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            去支付 ¥{order.totalPrice}
          </button>
        </div>
      )}

      {/* 状态步骤 */}
      <div style={{ padding: '20px 16px', background: '#fff', marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {STATUS_STEPS.map((step, idx) => {
            // pending not reached yet but order.status is pending
            const isCurrent = step === order.status;
            const isDone = idx < currentStep || (currentStep < 0 && step === 'pending');
            const isActive = isCurrent || (idx <= currentStep);
            return (
              <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: isActive ? '#1677ff' : '#e8e8e8',
                    color: '#fff',
                    fontSize: 12,
                    lineHeight: '24px',
                    margin: '0 auto',
                  }}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    marginTop: 4,
                    color: isActive ? '#1677ff' : '#999',
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                >
                  {ORDER_STATUS_MAP[step]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 支付信息 */}
      {order.paymentMethod && (
        <div style={{ padding: '12px 16px', background: '#fff', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#666' }}>
            {order.paymentMethod === 'wechat' ? '💚 微信支付' : '💙 支付宝'}
          </span>
          <span style={{ fontSize: 12, color: '#999' }}>
            {order.paidAt ? new Date(order.paidAt).toLocaleTimeString('zh-CN') : ''}
          </span>
        </div>
      )}

      {/* 订单详情 */}
      <div style={{ padding: 16, background: '#fff', marginTop: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>订单明细</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>桌号: {order.table?.number}</div>
        {order.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{item.dish.emoji}</span>
              <span style={{ fontSize: 14 }}>{item.dish.name}</span>
              <span style={{ fontSize: 12, color: '#999' }}>×{item.quantity}</span>
            </div>
            <span style={{ fontSize: 14 }}>¥{item.price * item.quantity}</span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid #f0f0f0',
            marginTop: 8,
          }}
        >
          <span style={{ fontWeight: 600 }}>合计</span>
          <span style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 18 }}>¥{order.totalPrice}</span>
        </div>
      </div>

      <div style={{ padding: 16, textAlign: 'center' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 40px',
            borderRadius: 24,
            border: '1px solid #1677ff',
            background: '#fff',
            color: '#1677ff',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
