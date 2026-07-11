import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrder } from '../../api/endpoints';
import { api } from '../../api/client';
import type { Order } from '../../types';

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const [order, setOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [step, setStep] = useState<'select' | 'qrcode' | 'done'>('select');
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder(orderId).then(setOrder).catch(console.error);
  }, [orderId]);

  const handlePaySuccess = async () => {
    setConfirming(true);
    try {
      const updated = await api.post(`/orders/${orderId}/pay`, { paymentMethod: method });
      setOrder(updated.data);
      setStep('done');
    } catch {
      setStep('done');
    }
    setConfirming(false);
  };

  if (!order) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 60, textAlign: 'center', color: '#999' }}>
        加载中...
      </div>
    );
  }

  if (order.status !== 'pending' && order.status !== 'paid') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>📋</div>
        <div style={{ color: '#999', marginTop: 12 }}>此订单无需支付</div>
        <button
          onClick={() => navigate(`/order/${orderId}`)}
          style={{
            marginTop: 16, padding: '10px 28px', borderRadius: 24,
            border: 'none', background: '#1677ff', color: '#fff', cursor: 'pointer',
          }}
        >
          查看订单状态
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部 */}
      <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f0f0f0' }}>
        <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>收银台</span>
      </div>

      {/* 订单金额 */}
      <div style={{ background: '#fff', marginTop: 8, padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#999' }}>订单 {order.orderNo}</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#ff4d4f', marginTop: 4 }}>
          ¥{order.totalPrice}
        </div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
          桌号: {order.table?.number} | {order.items?.length || 0} 个菜品
        </div>
      </div>

      {/* 支付方式选择 */}
      {step === 'select' && (
        <div style={{ background: '#fff', marginTop: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>选择支付方式</div>
          <div
            onClick={() => setMethod('wechat')}
            style={{
              display: 'flex', alignItems: 'center', padding: '14px 12px', borderRadius: 8,
              border: method === 'wechat' ? '2px solid #07c160' : '1px solid #e8e8e8',
              background: method === 'wechat' ? '#f0fff4' : '#fff',
              marginBottom: 10, cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 32, marginRight: 12 }}>💚</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>微信支付</div>
              <div style={{ fontSize: 11, color: '#999' }}>使用微信扫一扫付款</div>
            </div>
            {method === 'wechat' && <span style={{ color: '#07c160', fontSize: 20 }}>✓</span>}
          </div>
          <div
            onClick={() => setMethod('alipay')}
            style={{
              display: 'flex', alignItems: 'center', padding: '14px 12px', borderRadius: 8,
              border: method === 'alipay' ? '2px solid #1677ff' : '1px solid #e8e8e8',
              background: method === 'alipay' ? '#f0f5ff' : '#fff',
              cursor: 'pointer', opacity: 0.5,
            }}
          >
            <span style={{ fontSize: 32, marginRight: 12 }}>💙</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>支付宝</div>
              <div style={{ fontSize: 11, color: '#999' }}>暂未配置收款码</div>
            </div>
          </div>
          <button
            onClick={() => setStep('qrcode')}
            style={{
              width: '100%', marginTop: 16, padding: '14px', borderRadius: 8,
              border: 'none', background: '#07c160', color: '#fff',
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
            }}
          >
            确认支付 ¥{order.totalPrice}
          </button>
        </div>
      )}

      {/* 收款码 */}
      {step === 'qrcode' && (
        <div style={{ background: '#fff', marginTop: 8, padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            微信扫一扫付款
          </div>
          <div style={{
            fontSize: 13, color: '#999', marginBottom: 16,
            background: '#fff7e6', padding: '8px 12px', borderRadius: 6,
          }}>
            请另一部手机扫码，或截图后到微信识别二维码
          </div>

          {/* 真实收款码 */}
          <div style={{
            width: 240,
            height: 240,
            margin: '0 auto',
            borderRadius: 12,
            overflow: 'hidden',
            border: '2px solid #07c160',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src="/wechat-qr.jpg"
              alt="微信收款码"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div style={{ fontSize: 14, color: '#07c160', marginTop: 12, fontWeight: 600 }}>
            请支付 ¥{order.totalPrice}
          </div>

          {/* 手动确认按钮 */}
          <button
            onClick={handlePaySuccess}
            disabled={confirming}
            style={{
              width: '100%', marginTop: 20, padding: '14px', borderRadius: 8,
              border: 'none',
              background: confirming ? '#ccc' : '#07c160',
              color: '#fff', fontSize: 16, fontWeight: 600,
              cursor: confirming ? 'not-allowed' : 'pointer',
            }}
          >
            {confirming ? '确认中...' : '我已完成支付'}
          </button>
          <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
            付款成功后请点击上方按钮确认
          </div>
        </div>
      )}

      {/* 支付成功 */}
      {step === 'done' && (
        <div style={{ background: '#fff', marginTop: 8, padding: '40px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#52c41a' }}>支付成功</div>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>¥{order.totalPrice}</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            微信支付 · {new Date().toLocaleTimeString('zh-CN')}
          </div>
          <button
            onClick={() => navigate(`/order/${orderId}`)}
            style={{
              marginTop: 24, padding: '12px 40px', borderRadius: 24,
              border: 'none', background: '#1677ff', color: '#fff',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            查看订单状态
          </button>
        </div>
      )}
    </div>
  );
}
