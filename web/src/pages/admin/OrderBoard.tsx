import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, updateOrderStatus, verifyToken } from '../../api/endpoints';
import { getSocket, disconnectSocket } from '../../socket';
import { ORDER_STATUS_MAP } from '../../types';
import type { Order, OrderStatus } from '../../types';

export default function OrderBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 验证登录状态
    verifyToken().catch(() => {
      navigate('/admin/login');
      return;
    });

    loadOrders();

    // WebSocket 实时监听
    const socket = getSocket();
    socket.emit('join:kitchen');
    socket.on('order:new', (order: Order) => {
      setOrders((prev) => [order, ...prev]);
    });
    socket.on('order:status-update', (updated: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    });

    return () => {
      socket.off('order:new');
      socket.off('order:status-update');
      disconnectSocket();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders(filter ? { status: filter } : undefined);
      setOrders(data);
    } catch {
      navigate('/admin/login');
    }
    setLoading(false);
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    await updateOrderStatus(orderId, status);
    // 实时更新由 Socket 推送处理
  };

  const nextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: null,   // 等待顾客支付
      paid: 'cooking', // 已支付，开始制作
      cooking: 'ready',
      ready: 'served',
      served: null,
    };
    return flow[current];
  };

  const filteredOrders = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 导航栏 */}
      <div
        style={{
          background: '#1a1a1a',
          color: '#fff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>👨‍🍳 后厨看板</span>
          <span style={{ background: '#ff4d4f', color: '#fff', fontSize: 11, padding: '1px 6px', borderRadius: 8 }}>
            {orders.filter((o) => o.status === 'pending').length} 待处理
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/qrcodes')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #555',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            桌台二维码
          </button>
          <button
            onClick={() => navigate('/admin/menu')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #555',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            菜品管理
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/admin/login');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #555',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            退出
          </button>
        </div>
      </div>

      {/* 状态筛选 */}
      <div style={{ padding: '12px 20px', background: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('')}
          style={{
            padding: '4px 14px',
            borderRadius: 16,
            border: filter === '' ? '2px solid #1677ff' : '1px solid #e8e8e8',
            background: filter === '' ? '#e6f4ff' : '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: filter === '' ? 600 : 400,
          }}
        >
          全部
        </button>
        {(['pending', 'paid', 'cooking', 'ready', 'served'] as OrderStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '4px 14px',
              borderRadius: 16,
              border: filter === s ? '2px solid #1677ff' : '1px solid #e8e8e8',
              background: filter === s ? '#e6f4ff' : '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: filter === s ? 600 : 400,
            }}
          >
            {ORDER_STATUS_MAP[s]}
          </button>
        ))}
      </div>

      {/* 订单列表 */}
      <div style={{ padding: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无订单</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  borderLeft: `4px solid ${order.status === 'pending' ? '#ff4d4f' : order.status === 'cooking' ? '#fa8c16' : order.status === 'ready' ? '#52c41a' : '#999'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>#{order.orderNo}</span>
                  <span
                    style={{
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: order.status === 'pending' ? '#fff2f0' : order.status === 'cooking' ? '#fff7e6' : '#f6ffed',
                      color: order.status === 'pending' ? '#ff4d4f' : order.status === 'cooking' ? '#fa8c16' : '#52c41a',
                    }}
                  >
                    {ORDER_STATUS_MAP[order.status]}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                  桌号: {order.table?.number}
                  {order.remark && ` | 备注: ${order.remark}`}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                  {new Date(order.createdAt).toLocaleTimeString('zh-CN')}
                </div>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      padding: '2px 0',
                    }}
                  >
                    <span>
                      {item.dish.emoji} {item.dish.name} × {item.quantity}
                    </span>
                    <span>¥{item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#ff4d4f' }}>¥{order.totalPrice}</span>
                  {nextStatus(order.status) && (
                    <button
                      onClick={() => handleStatusChange(order.id, nextStatus(order.status)!)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#1677ff',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      → {ORDER_STATUS_MAP[nextStatus(order.status)!]}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
