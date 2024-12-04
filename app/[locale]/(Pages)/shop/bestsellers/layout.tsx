import { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: locale === "ru" ? "Хиты продаж" : "Produse Populare",
    description:
      locale === "ru"
        ? "Откройте для себя наши самые популярные товары. Бестселлеры, которые выбирают покупатели."
        : "Descoperă cele mai populare produse ale noastre. Bestsellers alese de cumpărători.",
    openGraph: {
      title: locale === "ru" ? "Хиты продаж" : "Produse Populare",
      description:
        locale === "ru"
          ? "Откройте для себя наши самые популярные товары"
          : "Descoperă cele mai populare produse ale noastre",
      type: "website",
      locale: locale,
      siteName: "Gamma",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/shop/bestsellers`,
      languages: {
        "ru-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ru/shop/bestsellers`,
        "ro-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ro/shop/bestsellers`,
      },
    },
  };
}

export default function BestsellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
