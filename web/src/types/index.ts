export interface Category {
  id: number;
  name: string;
  sort: number;
  _count?: { dishes: number };
}

export interface Dish {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  emoji: string;
  spicyLevel: number;
  isRecommended: boolean;
  isAvailable: boolean;
  categoryId: number;
  category?: Category;
}

export interface Table {
  id: number;
  number: string;
  capacity: number;
  status: string;
  orders?: Order[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  dishId: number;
  quantity: number;
  price: number;
  dish: Dish;
}

export interface Order {
  id: number;
  orderNo: string;
  tableId: number;
  status: OrderStatus;
  totalPrice: number;
  remark?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  table?: Table;
}

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'paid';

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  cooking: '制作中',
  ready: '已完成',
  served: '已上菜',
};

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface Recommendation {
  dishId: number;
  reason: string;
}
