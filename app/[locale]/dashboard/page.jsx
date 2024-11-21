import { getTranslations } from "next-intl/server";
import DashboardClient from "./DashboardClient";

export const generateStaticParams = async () => {
  return [{ locale: "ru" }, { locale: "ro" }];
};

export default async function DashboardPage() {
  const t = await getTranslations();

  const tabs = ["profile", "addresses", "orders"];
  const titles = {
    profile: t("auth.Dashboard"),
    addresses: t("auth.addresses_title"),
    orders: t("auth.orders_title"),
  };

  return (
    <DashboardClient
      tabs={tabs}
      titles={titles}
      translations={{
        dashboard: t("auth.Dashboard"),
        deliveryAddress: t("address.delivery_address"),
        ordersTitle: t("auth.orders_title"),
      }}
    />
  );
}
