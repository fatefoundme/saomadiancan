import { create } from 'zustand';
import type { Dish, CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  tableId: number | null;
  setTable: (id: number) => void;
  addItem: (dish: Dish) => void;
  removeItem: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  tableId: null,

  setTable: (id) => set({ tableId: id }),

  addItem: (dish) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i.dish.id === dish.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 };
    } else {
      items.push({ dish, quantity: 1 });
    }
    set({ items });
  },

  removeItem: (dishId) => {
    set({ items: get().items.filter((i) => i.dish.id !== dishId) });
  },

  updateQuantity: (dishId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(dishId);
      return;
    }
    set({
      items: get().items.map((i) => (i.dish.id === dishId ? { ...i, quantity } : i)),
    });
  },

  clearCart: () => set({ items: [] }),

  totalPrice: () => get().items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0),

  totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
