import ContactForm from "./ContactForm";
import { headers } from "next/headers";

export async function generateMetadata({ params: paramsPromise }) {
  const headersList = await headers();
  const params = await paramsPromise;

  const domain = headersList.get("host") || process.env.NEXT_PUBLIC_BASE_URL;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${domain}`;

  const locale = params.locale;

  const title = locale === "ru" ? "Контакты | Gamma" : "Contacte | Gamma";
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

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <ContactForm />;
}
