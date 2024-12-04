import { headers } from "next/headers";
import ClientContact from "./ClientContact";

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "ro" }];
}

export async function generateMetadata({ params }) {
  const headersList = await headers();
  const domain = headersList.get("host") || process.env.NEXT_PUBLIC_BASE_URL;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${domain}`;

  const resolvedParams = await params;
  const { locale } = resolvedParams;

  const title = locale === "ru" ? "Контакты" : "Contacte";
  const description =
    locale === "ru"
      ? "Свяжитесь с нами. Мы всегда готовы помочь вам с любыми вопросами"
      : "Contactați-ne. Suntem mereu gata să vă ajutăm cu orice întrebare";

  const url = `${baseUrl}/${locale}/contact`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale,
      url,
      siteName: locale === "ru" ? "Gamma" : "Gamma",
      images: [
        {
          url: locale === "ru" ? "/Контакты.webp" : "/Contacte.webp",
          width: 1200,
          height: 630,
          alt: locale === "ru" ? "Контакты" : "Contacte",
        },
      ],
    },
    alternates: {
      canonical: url,
      languages: {
        "ro-MD": `${baseUrl}/ro/contact`,
        "ru-MD": `${baseUrl}/ru/contact`,
      },
    },
  };
}

export default function Page() {
  return <ClientContact />;
}
