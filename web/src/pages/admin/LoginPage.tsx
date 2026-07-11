import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/endpoints';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token);
      navigate('/admin/orders');
    } catch {
      setError('用户名或密码错误');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 40,
        background: '#f5f5f5',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48 }}>👨‍🍳</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>后台管理</div>
        <div style={{ color: '#999', fontSize: 13, marginTop: 4 }}>扫码点餐管理系统</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: '#666', marginBottom: 4, display: 'block' }}>用户名</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: '#666', marginBottom: 4, display: 'block' }}>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="admin123"
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
        {error && <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            border: 'none',
            background: loading ? '#ccc' : '#1677ff',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </div>
    </div>
  );
}
