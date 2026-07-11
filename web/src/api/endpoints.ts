import { api } from './client';
import type { Category, Dish, Table, Order, Recommendation } from '../types';

// 分类
export const fetchCategories = () => api.get<Category[]>('/categories').then((r) => r.data);

// 菜品
export const fetchDishes = (params?: { categoryId?: number; kw?: string }) =>
  api.get<Dish[]>('/dishes', { params }).then((r) => r.data);

// 桌台
export const fetchTables = () => api.get<Table[]>('/tables').then((r) => r.data);

// 订单
export const createOrder = (data: { tableId: number; items: { dishId: number; quantity: number }[]; remark?: string }) =>
  api.post<Order>('/orders', data).then((r) => r.data);

export const fetchOrders = (params?: { status?: string }) =>
  api.get<Order[]>('/orders', { params }).then((r) => r.data);

export const fetchOrder = (id: number) => api.get<Order>(`/orders/${id}`).then((r) => r.data);

export const updateOrderStatus = (id: number, status: string) =>
  api.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data);

// AI 推荐
export const fetchRecommendations = (data: { cartDishIds?: number[]; tableId?: number }) =>
  api.post<{ recommendations: Recommendation[] }>('/recommendations', data).then((r) => r.data);

// 认证
export const login = (username: string, password: string) =>
  api.post<{ token: string; username: string }>('/auth/login', { username, password }).then((r) => r.data);

export const verifyToken = () => api.get('/auth/verify').then((r) => r.data);
