"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthModal } from "@/hooks/useAuthModal";

interface CouponSectionProps {
  onDiscountApplied?: (discount: number, couponName: string) => void;
}

export const CouponSection = ({ onDiscountApplied }: CouponSectionProps) => {
  const t = useTranslations();
  const { data: session } = useSession();
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!session) {
      openAuthModal();
      toast({
        title: t("checkout.login_required"),
        description: t("checkout.login_to_apply_coupon"),
        variant: "destructive",
      });
      return;
    }

    if (!couponCode.trim()) {
      toast({
        title: t("checkout.error"),
        description: t("checkout.enter_valid_coupon"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/orders/cuponUsage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ couponCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(t(data.error));
      }

      toast({
        title: t("checkout.success"),
        description: t(data.message),
      });

      if (onDiscountApplied) {
        onDiscountApplied(data.discount, couponCode);
      }

      setCouponCode("");
    } catch (error) {
      toast({
        title: t("checkout.error"),
        description:
          error instanceof Error ? error.message : t("checkout.generic_error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-charade-900 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">
        {t("checkout.apply_coupon")}
      </h2>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t("checkout.enter_coupon")}
          value={couponCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCouponCode(e.target.value)
          }
          className="flex-1 p-2 rounded-lg dark:bg-[#4a4b59] bg-gray-100"
        />
        <Button
          onClick={handleApplyCoupon}
          disabled={isLoading}
          className="bg-accent hover:bg-charade-900 text-white h-[42px] dark:bg-accent dark:hover:bg-charade-900"
        >
          {isLoading ? t("checkout.applying") : t("checkout.apply")}
        </Button>
      </div>
    </div>
  );
};
