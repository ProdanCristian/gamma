import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DeliveryZone = "in_city" | "outside_city";

export interface DeliveryRules {
  cost: number;
  freeDeliveryThreshold: number;
}

export const DELIVERY_RULES: Record<DeliveryZone, DeliveryRules> = {
  in_city: {
    cost: 50,
    freeDeliveryThreshold: 1000,
  },
  outside_city: {
    cost: 60,
    freeDeliveryThreshold: 1000,
  },
};

export interface CartItem {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  deliveryZone: DeliveryZone;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setDeliveryZone: (zone: DeliveryZone) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      deliveryZone: "in_city",
      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === newItem.id
          );
          if (existingItem) {
            return {
              ...state,
              isOpen: true,
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + newItem.quantity,
                        item.stock
                      ),
                    }
                  : item
              ),
            };
          }
          return {
            ...state,
            isOpen: true,
            items: [...state.items, newItem],
          };
        }),
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setDeliveryZone: (zone) => set({ deliveryZone: zone }),
    }),
    {
      name: "cart-storage",
    }
  )
);
