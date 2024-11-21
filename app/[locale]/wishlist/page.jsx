import { getTranslations } from "next-intl/server";
import WishlistClient from "./Wishlist";

export const generateStaticParams = async () => {
  return [{ locale: "ru" }, { locale: "ro" }];
};

export default async function WishlistPage() {
  const t = await getTranslations("wishlist");

  return (
    <WishlistClient
      translations={{
        title: t("title"),
        emptyWishlist: t("empty_wishlist"),
      }}
    />
  );
}
