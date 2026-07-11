import { create } from 'zustand';
import type { Order } from '../types';

interface OrderStore {
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  currentOrder: null,
  setCurrentOrder: (order) => set({ currentOrder: order }),
}));
