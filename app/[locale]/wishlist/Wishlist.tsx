"use client";

import { useWishlist } from "@/lib/store/useWishlist";
import ProductCard from "@/components/Shop/ProductCard";

interface WishlistClientProps {
  translations: {
    title: string;
    emptyWishlist: string;
  };
}

export default function WishlistClient({ translations }: WishlistClientProps) {
  const { items } = useWishlist();

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">{translations.title}</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">{translations.emptyWishlist}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const formattedProduct = {
              id: item.id,
              Nume_Produs_RO: item.name,
              Nume_Produs_RU: item.name,
              Imagine_Principala: JSON.stringify([{ path: item.image }]),
              Pret_Standard: item.price,
              Pret_Redus: item.discount,
              Stock: item.stock,
            };
            return <ProductCard key={item.id} product={formattedProduct} />;
          })}
        </div>
      )}
    </div>
  );
}
