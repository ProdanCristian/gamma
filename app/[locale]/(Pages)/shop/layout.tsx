import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: locale === "ru" ? "Магазин | Gamma" : "Magazin | Gamma",
    description:
      locale === "ru"
        ? "Исследуйте наш широкий ассортимент продукции. Найдите идеальные товары для вас."
        : "Explorează gama noastră largă de produse. Găsește produsele perfecte pentru tine.",
    openGraph: {
      title: locale === "ru" ? "Магазин | Gamma" : "Magazin | Gamma",
      description:
        locale === "ru"
          ? "Исследуйте наш широкий ассортимент продукции"
          : "Explorează gama noastră largă de produse",
      type: "website",
      locale: locale,
      siteName: "Gamma",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/shop`,
      languages: {
        "ru-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ru/shop`,
        "ro-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ro/shop`,
      },
    },
  };
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 