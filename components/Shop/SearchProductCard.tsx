"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  PiShoppingCartSimple,
  PiCursorClick,
  PiHeartFill,
  PiYoutubeLogo,
} from "react-icons/pi";
import { useRouter } from "next/navigation";
import { useFastOrderStore } from "@/lib/store/useFastOrderStore";
import { useWishlist } from "@/lib/store/useWishlist";
import { useCartStore } from "@/lib/store/useCart";
import slugify from "slugify";

interface Product {
  id: number;
  name_ro: string;
  name_ru: string;
  price: number;
  discounted_price: number | null;
  main_image: string;
  stock: number;
  video?: string;
  is_bestseller?: boolean;
  has_discount: boolean;
  discount_percentage: number;
}

interface SearchProductCardProps {
  product: Product;
  onVideoClick?: (videoUrl: string) => void;
}

interface WishlistItem {
  id: number;
  name: string;
  image: string;
  price: string;
  discount: string;
  stock: string;
  slug: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image: string;
  stock: number;
}

interface FastOrderItem {
  id: number;
  name: string;
  image: string;
  price: string;
  discount: string;
  stock: string;
}

const SearchProductCard = ({
  product,
  onVideoClick,
}: SearchProductCardProps) => {
  const t = useTranslations("productcard");
  const locale = useLocale();
  const router = useRouter();

  const setProduct = useFastOrderStore((state: any) => state.setProduct);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const addItem = useCartStore((state: any) => state.addItem);

  const getImagePath = (imagePath: string): string => {
    if (!imagePath) return "/placeholder-image.jpg";

    const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/$/, "");

    try {
      if (imagePath.startsWith("[")) {
        const parsed = JSON.parse(imagePath);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const path = parsed[0].path.replace(/^\/+/, "");
          return `${baseUrl}/${path}`;
        }
      }

      const cleanPath = imagePath.replace(/^\/+/, "");
      return `${baseUrl}/${cleanPath}`;
    } catch (error) {
      console.error("Error parsing image path:", error);
      return "/placeholder-image.jpg";
    }
  };

  const productData = useMemo(() => {
    return {
      id: product.id,
      name: locale === "ro" ? product.name_ro : product.name_ru,
      price: product.price,
      discounted_price: product.discounted_price,
      image: getImagePath(product.main_image),
      stock: product.stock,
      video: product.video,
      is_bestseller: product.is_bestseller,
      slug: slugify(product.name_ro, {
        replacement: "-",
        lower: true,
        strict: true,
      }),
    };
  }, [product, locale]);

  const isOutOfStock = useMemo(() => {
    return !productData.stock || productData.stock <= 0;
  }, [productData.stock]);

  const handleVideoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (productData.video && onVideoClick) {
      onVideoClick(productData.video);
    }
  };

  const addToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const cartItem: CartItem = {
      id: productData.id,
      name: productData.name,
      price: productData.price,
      discountPrice: productData.discounted_price || undefined,
      quantity: 1,
      image: productData.image,
      stock: productData.stock,
    };

    addItem(cartItem);
  };

  const buyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const fastOrderItem: FastOrderItem = {
      id: productData.id,
      name: productData.name,
      image: productData.image,
      price: productData.price.toString(),
      discount: productData.discounted_price?.toString() || "",
      stock: productData.stock.toString(),
    };

    setProduct(fastOrderItem);
  };

  const toggleWishlist = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const wishlistItem: WishlistItem = {
      id: productData.id,
      name: productData.name,
      image: productData.image,
      price: productData.price.toString(),
      discount: productData.discounted_price?.toString() || "",
      stock: productData.stock.toString(),
      slug: productData.slug,
    };

    if (isInWishlist(productData.id)) {
      removeFromWishlist(productData.id);
    } else {
      addToWishlist(wishlistItem);
    }
  };

  return (
    <div className="group relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden py-2 p-4 space-y-4 hover:border-[#47e194] dark:hover:border-[#47e194] transition-colors duration-200">
      <div
        onClick={() =>
          router.push(
            `/${locale}/product/${productData.slug}_${productData.id}`
          )
        }
        className="cursor-pointer"
      >
        <div className="relative h-40 flex items-center justify-center">
          <div className="relative w-[160px] h-[160px] group-hover:drop-shadow-[0_0_8px_rgba(71,225,148,0.5)] transition-all duration-300">
            <Image
              alt={productData.name}
              src={productData.image}
              className="max-w-full max-h-[160px] w-auto h-auto object-contain group-hover:opacity-90 transition-opacity duration-200"
              width={160}
              height={160}
            />
          </div>
        </div>

        <PiHeartFill
          onClick={toggleWishlist}
          className={`absolute top-2 left-2 hover:scale-110 transition-transform duration-200 ${
            isInWishlist(productData.id)
              ? "text-red-500"
              : "text-gray-300 dark:text-gray-600"
          }`}
          size={30}
        />

        {productData.video && (
          <button
            onClick={handleVideoClick}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
          >
            <PiYoutubeLogo size={20} />
          </button>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold line-clamp-1">
            {productData.name}
          </h2>
          <div className="flex justify-between">
            <span
              className={
                productData.discounted_price ? "line-through text-gray-500" : ""
              }
            >
              {productData.price} {t("lei")}
            </span>
            {productData.discounted_price && (
              <span className="text-lg font-semibold text-red-500">
                {productData.discounted_price} {t("lei")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={buyNow}
          disabled={isOutOfStock}
          className={`dark:bg-gray-500 bg-gray-600 hover:bg-charade-900 dark:hover:bg-charade-900 py-[2px] text-white text-sm font-semibold px-4 rounded-lg flex items-center justify-center content-center w-full transition-colors duration-200 ${
            isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isOutOfStock ? t("out_of_stock") : t("order_now")}
          <PiCursorClick className="ml-2" size={30} />
        </button>
        <button
          onClick={addToCart}
          disabled={isOutOfStock}
          className={`transition-colors duration-200 hover:text-[#47e194] ${
            isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <PiShoppingCartSimple size={35} />
        </button>
      </div>
    </div>
  );
};

export default SearchProductCard;
