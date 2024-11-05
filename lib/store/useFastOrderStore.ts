import { create } from "zustand";

interface FastOrderStore {
  isOpen: boolean;
  product: {
    id: number;
    name: string;
    image: string;
    price: string;
    discount?: string;
    stock: string;
    quantity?: string;
  } | null;
  setOpen: (open: boolean) => void;
  setProduct: (product: FastOrderStore["product"]) => void;
}

export const useFastOrderStore = create<FastOrderStore>((set) => ({
  isOpen: false,
  product: null,
  setOpen: (open) => set({ isOpen: open }),
  setProduct: (product) =>
    set({
      product: product
        ? { ...product, quantity: product.quantity || "1" }
        : null,
      isOpen: true,
    }),
}));
