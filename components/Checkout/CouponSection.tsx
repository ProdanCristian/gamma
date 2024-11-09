"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthModal } from "@/hooks/useAuthModal";

export const CouponSection = () => {
  const t = useTranslations();
  const { data: session } = useSession();
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [couponCode, setCouponCode] = useState("");

  const handleApplyCoupon = () => {
    if (!session) {
      openAuthModal();
      toast({
        title: t("checkout.login_required"),
        description: t("checkout.login_to_apply_coupon"),
        variant: "destructive",
      });
      return;
    }
    // Add coupon application logic here
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
          className="bg-accent hover:bg-charade-900 text-white h-[42px] dark:bg-accent dark:hover:bg-charade-900"
        >
          {t("checkout.apply")}
        </Button>
      </div>
    </div>
  );
};
