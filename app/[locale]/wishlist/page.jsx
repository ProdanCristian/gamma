"use client";

import { useTranslations } from "next-intl";
import { useWishlist } from "@/lib/store/useWishlist";
import ProductCard from "@/components/Shop/ProductCard";

const WishlistPage = () => {
  const t = useTranslations("wishlist");
  const { items } = useWishlist();

  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">{t("empty_wishlist")}</p>
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
};

export default WishlistPage;
