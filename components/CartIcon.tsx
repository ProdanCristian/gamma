"use client";

import { PiShoppingCart } from "react-icons/pi";
import { useCart } from "@/lib/store/useCart";

interface CartIconProps {
  size?: number;
  marginRight?: string;
}

export default function CartIcon({ size, marginRight }: CartIconProps) {
  const openCart = useCart((state) => state.openCart);

  return (
    <PiShoppingCart
      size={size}
      className={`text-white cursor-pointer hover:text-accent transition-colors ${marginRight}
      }`}
      onClick={openCart}
    />
  );
}