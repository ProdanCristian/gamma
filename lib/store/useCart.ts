import { create } from "zustand";

interface CartStore {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
