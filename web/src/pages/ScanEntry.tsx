import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchTables } from '../api/endpoints';
import { useCartStore } from '../stores/cartStore';
import type { Table } from '../types';

export default function ScanEntry() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const setTable = useCartStore((s) => s.setTable);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables()
      .then(setTables)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (table: Table) => {
    setTable(table.id);
    navigate(`/menu/${table.id}`);
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' }}>
      <div
        style={{
          background: '#1677ff',
          color: '#fff',
          padding: '40px 20px 30px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>🍽️</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>扫码点餐</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>请选择您的桌号</div>
      </div>

      <div style={{ padding: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => handleSelect(table)}
                style={{
                  background: table.status === 'occupied' ? '#fff2f0' : '#fff',
                  borderRadius: 12,
                  padding: '20px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: table.status === 'occupied' ? '1px solid #ffccc7' : '1px solid #e8e8e8',
                  opacity: table.status === 'occupied' ? 0.6 : 1,
                }}
              >
                <div style={{ fontSize: 32 }}>🪑</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{table.number}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{table.capacity} 人桌</div>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 4,
                    color: table.status === 'available' ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {table.status === 'available' ? '空闲' : '用餐中'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0 40px' }}>
        <Link
          to="/qrcodes"
          style={{
            color: '#1677ff',
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          打印桌台二维码 →
        </Link>
      </div>
    </div>
  );
}
