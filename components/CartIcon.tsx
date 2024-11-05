"use client";

import { PiShoppingCart } from "react-icons/pi";
import { useCart } from "@/lib/store/useCart";

interface CartIconProps {
  size?: number;
  className?: string;
}

export default function CartIcon({
  size = 26,
  className = "text-white mr-4",
}: CartIconProps) {
  const openCart = useCart((state) => state.openCart);

  return (
    <PiShoppingCart
      size={size}
      className={`${className} cursor-pointer hover:text-accent transition-colors`}
      onClick={openCart}
    />
  );
}
