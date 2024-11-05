import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistProduct {
  id: number;
  name: string;
  image: string;
  price: string;
  discount: string;
  stock: string;
  slug: string;
}

interface WishlistStore {
  items: WishlistProduct[];
  addToWishlist: (product: WishlistProduct) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (product) => {
        set((state) => ({
          items: [...state.items, product],
        }));
      },
      removeFromWishlist: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: "wishlist-storage",
    }
  )
);
