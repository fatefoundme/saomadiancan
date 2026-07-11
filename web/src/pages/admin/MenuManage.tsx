import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchDishes } from '../../api/endpoints';
import { verifyToken } from '../../api/endpoints';
import type { Category, Dish } from '../../types';
import { api } from '../../api/client';

interface FormData {
  name: string;
  emoji: string;
  price: string;
  spicyLevel: string;
  description: string;
  image: string;
  categoryId: number;
  isAvailable: boolean;
}

function dishToForm(d: Partial<Dish> | null): FormData {
  return {
    name: d?.name || '',
    emoji: d?.emoji || '🍽️',
    price: d?.price !== undefined ? String(d.price) : '',
    spicyLevel: d?.spicyLevel !== undefined ? String(d.spicyLevel) : '0',
    description: d?.description || '',
    image: d?.image || '',
    categoryId: d?.categoryId || 1,
    isAvailable: d?.isAvailable ?? true,
  };
}

export default function MenuManage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(dishToForm(null));
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    verifyToken().catch(() => navigate('/admin/login'));
    loadData();
  }, []);

  const loadData = async () => {
    const [cats, d] = await Promise.all([fetchCategories(), fetchDishes()]);
    setCategories(cats);
    setDishes(d);
  };

  const handleToggle = async (dish: Dish) => {
    await api.put(`/dishes/${dish.id}`, { ...dish, isAvailable: !dish.isAvailable, categoryId: dish.categoryId });
    loadData();
  };

  const openNew = () => {
    setEditingId(null);
    setForm(dishToForm({ categoryId: activeCat ?? 1 }));
    setShowForm(true);
  };

  const openEdit = (dish: Dish) => {
    setEditingId(dish.id);
    setForm(dishToForm(dish));
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/upload', fd);
      setForm((f) => ({ ...f, image: res.data.url }));
    } catch (err: any) {
      alert(err?.response?.data?.error || '上传失败');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    const price = parseFloat(form.price);
    if (!form.name || isNaN(price) || price <= 0) {
      alert('请填写名称和有效的价格');
      return;
    }
    const data = {
      name: form.name,
      emoji: form.emoji,
      price,
      spicyLevel: parseInt(form.spicyLevel) || 0,
      description: form.description,
      image: form.image || undefined,
      categoryId: form.categoryId,
      isAvailable: form.isAvailable,
    };

    try {
      if (editingId) {
        await api.put(`/dishes/${editingId}`, data);
      } else {
        await api.post('/dishes', data);
      }
      setShowForm(false);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.error || '保存失败');
    }
  };

  const updateField = (field: keyof FormData, value: string | number | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const filteredDishes = activeCat ? dishes.filter((d) => d.categoryId === activeCat) : dishes;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: '#1a1a1a', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer' }}>←</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>菜品管理</span>
        </div>
        <button onClick={openNew} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#52c41a', color: '#fff', cursor: 'pointer', fontSize: 13 }}>
          + 新增菜品
        </button>
      </div>

      <div style={{ padding: '12px 20px', background: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveCat(null)} style={{ padding: '4px 14px', borderRadius: 16, border: activeCat === null ? '2px solid #1677ff' : '1px solid #e8e8e8', background: activeCat === null ? '#e6f4ff' : '#fff', cursor: 'pointer', fontSize: 13 }}>全部</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{ padding: '4px 14px', borderRadius: 16, border: activeCat === cat.id ? '2px solid #1677ff' : '1px solid #e8e8e8', background: activeCat === cat.id ? '#e6f4ff' : '#fff', cursor: 'pointer', fontSize: 13 }}>{cat.name}</button>
        ))}
      </div>

      <div style={{ padding: 12 }}>
        <table style={{ width: '100%', background: '#fff', borderRadius: 8, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: '10px 16px', fontSize: 13 }}>菜品</th>
              <th style={{ padding: '10px 16px', fontSize: 13 }}>分类</th>
              <th style={{ padding: '10px 16px', fontSize: 13 }}>价格</th>
              <th style={{ padding: '10px 16px', fontSize: 13 }}>状态</th>
              <th style={{ padding: '10px 16px', fontSize: 13 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredDishes.map((dish) => (
              <tr key={dish.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '8px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {dish.image ? (
                      <img src={dish.image} alt={dish.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 28 }}>{dish.emoji}</span>
                    )}
                    <span style={{ fontSize: 14 }}>{dish.name}</span>
                  </div>
                </td>
                <td style={{ padding: '8px 16px', fontSize: 13, color: '#666' }}>{dish.category?.name}</td>
                <td style={{ padding: '8px 16px', fontSize: 14, color: '#ff4d4f', fontWeight: 600 }}>¥{dish.price}</td>
                <td style={{ padding: '8px 16px' }}>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: dish.isAvailable ? '#f6ffed' : '#fff2f0', color: dish.isAvailable ? '#52c41a' : '#ff4d4f' }}>
                    {dish.isAvailable ? '上架' : '下架'}
                  </span>
                </td>
                <td style={{ padding: '8px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleToggle(dish)} style={{ padding: '3px 10px', borderRadius: 4, border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontSize: 12 }}>
                      {dish.isAvailable ? '下架' : '上架'}
                    </button>
                    <button onClick={() => openEdit(dish)} style={{ padding: '3px 10px', borderRadius: 4, border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontSize: 12 }}>编辑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 编辑弹窗 */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: 12, padding: 24, width: 380, maxHeight: '80vh', overflow: 'auto', zIndex: 999 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>{editingId ? '编辑菜品' : '新增菜品'}</div>

            {/* 名称 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block' }}>名称</label>
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8e8e8', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
            </div>

            {/* 图片预览 + 上传 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>图片</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {form.image ? (
                  <img src={form.image} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #e8e8e8' }} />
                ) : (
                  <div style={{ width: 60, height: 60, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: '1px solid #e8e8e8' }}>{form.emoji}</div>
                )}
                <div style={{ flex: 1 }}>
                  <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #1677ff', background: '#fff', color: '#1677ff', cursor: 'pointer', fontSize: 12, marginBottom: 4 }}>
                    {uploading ? '上传中...' : '上传图片'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                  <div style={{ fontSize: 11, color: '#999' }}>或手动输入URL：</div>
                </div>
              </div>
              <input
                value={form.image}
                onChange={(e) => updateField('image', e.target.value)}
                placeholder="https://xxx.jpg 或上传后自动填入"
                style={{ width: '100%', marginTop: 6, padding: '6px 10px', border: '1px solid #e8e8e8', borderRadius: 6, fontSize: 12, boxSizing: 'border-box' }}
              />
            </div>

            {/* Emoji 图标 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block' }}>Emoji图标（无图片时显示）</label>
              <input value={form.emoji} onChange={(e) => updateField('emoji', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8e8e8', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
            </div>

            {/* 价格 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block' }}>价格</label>
              <input
                value={form.price}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) updateField('price', v);
                }}
                placeholder="0.00"
                inputMode="decimal"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8e8e8', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            {/* 辣度 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block' }}>辣度 (0-3)</label>
              <select
                value={form.spicyLevel}
                onChange={(e) => updateField('spicyLevel', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8e8e8', borderRadius: 6, fontSize: 13 }}
              >
                <option value="0">0 - 不辣</option>
                <option value="1">1 - 微辣 🌶️</option>
                <option value="2">2 - 中辣 🌶️🌶️</option>
                <option value="3">3 - 特辣 🌶️🌶️🌶️</option>
              </select>
            </div>

            {/* 描述 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block' }}>描述</label>
              <input value={form.description} onChange={(e) => updateField('description', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8e8e8', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
            </div>

            {/* 分类 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block' }}>分类</label>
              <select value={form.categoryId} onChange={(e) => updateField('categoryId', Number(e.target.value))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8e8e8', borderRadius: 6, fontSize: 13 }}>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontSize: 13 }}>取消</button>
              <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: '#1677ff', color: '#fff', cursor: 'pointer', fontSize: 13 }}>保存</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
