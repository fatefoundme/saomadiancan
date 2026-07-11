import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { fetchTables } from '../api/endpoints';
import type { Table } from '../types';

export default function QRCodePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [customIp, setCustomIp] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    fetchTables()
      .then(setTables)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = useCustom && customIp
    ? `http://${customIp}:5173`
    : window.location.origin;

  if (loading) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 40, textAlign: 'center', color: '#999' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>桌台二维码</h2>
        <p style={{ color: '#999', fontSize: 13, margin: '4px 0 0' }}>
          打印后贴于桌角，客人扫码即可点餐
        </p>
      </div>

      {/* IP 配置提示 */}
      {isLocalhost && (
        <div
          style={{
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>手机扫码需在同一 WiFi 下</div>
          <div style={{ color: '#666', marginBottom: 8 }}>
            当前以 localhost 访问，手机无法打开。请在电脑上查看 IP 地址后填入：
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#666', whiteSpace: 'nowrap' }}>电脑 IP：</span>
            <input
              value={customIp}
              onChange={(e) => {
                setCustomIp(e.target.value);
                setUseCustom(true);
              }}
              placeholder="如 192.168.1.100"
              style={{
                flex: 1,
                minWidth: 180,
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                fontSize: 14,
              }}
            />
            <span style={{ color: '#999', fontSize: 11, whiteSpace: 'nowrap' }}>
              Win: <code>ipconfig</code> 查 IPv4
            </span>
          </div>
          {useCustom && customIp && (
            <div style={{ color: '#52c41a', marginTop: 8 }}>
              二维码已更新为 {baseUrl}/menu/桌号
            </div>
          )}
        </div>
      )}

      {/* 二维码网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 20,
        }}
      >
        {tables.map((table) => {
          const url = `${baseUrl}/menu/${table.id}`;
          return (
            <div
              key={table.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center',
                border: '1px solid #e8e8e8',
                pageBreakInside: 'avoid',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
                {table.number}
                <span style={{ fontSize: 12, color: '#999', fontWeight: 400, marginLeft: 6 }}>
                  {table.capacity}人桌
                </span>
              </div>
              <QRCodeSVG
                value={url}
                size={140}
                level="M"
                includeMargin
              />
              <div style={{ fontSize: 11, color: '#999', marginTop: 8, wordBreak: 'break-all' }}>
                {url}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '10px 32px',
            borderRadius: 8,
            border: 'none',
            background: '#1677ff',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          打印所有二维码
        </button>
        {useCustom && (
          <button
            onClick={() => { setUseCustom(false); setCustomIp(''); }}
            style={{
              padding: '10px 32px',
              borderRadius: 8,
              border: '1px solid #d9d9d9',
              background: '#fff',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            重置为 localhost
          </button>
        )}
      </div>
    </div>
  );
}
