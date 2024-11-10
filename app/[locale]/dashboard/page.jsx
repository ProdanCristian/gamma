"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfileTab } from "@/components/Dashboard/ProfileTab";
import { AddressTab } from "@/components/Dashboard/AdressTab";
import OrdersTab from "@/components/Dashboard/OrdersTab";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [isTranslationsLoaded, setIsTranslationsLoaded] = useState(false);

  let t;
  try {
    t = useTranslations();
    if (!isTranslationsLoaded) {
      setIsTranslationsLoaded(true);
    }
  } catch (error) {
    t = (key) => key;
  }

  const [selectedTab, setSelectedTab] = useState(
    searchParams.get("tab") || "profile"
  );
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/profile", {
        credentials: "include",
      });

      if (!response.ok) {
        router.push(`/${locale}/`);
        return;
      }

      const { user } = await response.json();
      setUserData(user);
    } catch (err) {
      router.push("/");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  const tabs = ["profile", "addresses", "orders"];
  const titles = {
    profile: "auth.Dashboard",
    addresses: "auth.addresses_title",
    orders: "auth.orders_title",
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    router.push(`/${locale}/dashboard?tab=${tab}`, { scroll: false });
  };

  if (!isTranslationsLoaded) {
    return (
      <div className="dashboard py-10 max-w-[1250px] w-[90vw] mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-6">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard py-10 max-w-[1250px] w-[90vw] mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        {t("auth.Dashboard")}
      </h1>

      <div className="space-y-6">
        <nav>
          <ul className="flex md:flex-row flex-col gap-4 mb-6 border border-gray-200 dark:border-charade-800 p-4 rounded-lg">
            {tabs.map((tab) => (
              <li
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 dark:text-white
                  ${
                    selectedTab === tab
                      ? "bg-accent text-white dark:bg-accent"
                      : ""
                  }`}
              >
                {t(titles[tab])}
              </li>
            ))}
          </ul>
        </nav>

        {selectedTab === "profile" && userData && (
          <ProfileTab userData={userData} refetchData={fetchUserData} />
        )}

        {selectedTab === "addresses" && (
          <div className="p-6 border-gray-200 dark:border-gray-700 dark:bg-charade-900 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-4 dark:text-white text-gray-700">
              {t("address.delivery_address")}
            </h2>
            <AddressTab />
          </div>
        )}

        {selectedTab === "orders" && (
          <div className="p-6 border-gray-200 dark:border-gray-700 dark:bg-charade-900 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-4 dark:text-white text-gray-700">
              {t("auth.orders_title")}
            </h2>
            <OrdersTab />
          </div>
        )}
      </div>
    </div>
  );
}
