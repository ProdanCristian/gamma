import { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: locale === "ru" ? "Скидки" : "Reduceri",
    description:
      locale === "ru"
        ? "Найдите лучшие предложения и скидки на нашу продукцию. Экономьте на покупках в Gamma."
        : "Găsiți cele mai bune oferte și reduceri la produsele noastre. Economisiți la cumpărături la Gamma.",
    openGraph: {
      title: locale === "ru" ? "Скидки" : "Reduceri",
      description:
        locale === "ru"
          ? "Найдите лучшие предложения и скидки на нашу продукцию"
          : "Găsiți cele mai bune oferte și reduceri la produsele noastre",
      type: "website",
      locale: locale,
      siteName: "Gamma",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/shop/discounts`,
      languages: {
        "ru-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ru/shop/discounts`,
        "ro-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ro/shop/discounts`,
      },
    },
  };
}

export default function DiscountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
