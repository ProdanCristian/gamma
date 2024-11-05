"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/store/useCart";
import { useTranslations } from "next-intl";

export default function Cart() {
  const isOpen = useCart((state) => state.isOpen);
  const closeCart = useCart((state) => state.closeCart);
  const t = useTranslations("Cart");

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        side="right"
        className="w-full sm:w-[400px] border-none dark:bg-charade-900"
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          {/* Cart items will go here */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
