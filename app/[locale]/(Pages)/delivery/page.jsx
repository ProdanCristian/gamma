import { useLocale } from "next-intl";
import { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const title = locale === "ru" ? "Доставка | Gamma" : "Livrare | Gamma";
  const description =
    locale === "ru"
      ? "Информация о доставке. Быстрая и надежная доставка по всей Молдове"
      : "Informații despre livrare. Livrare rapidă și sigură în toată Moldova";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale,
      siteName: locale === "ru" ? "Gamma" : "Gamma",
      images: [
        {
          url: locale === "ru" ? "/Доставка.webp" : "/Livrare.webp",
          width: 1200,
          height: 630,
          alt: locale === "ru" ? "Доставка" : "Livrare",
        },
      ],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/delivery`,
      languages: {
        ru: "/ru/delivery",
        ro: "/ro/delivery",
      },
    },
  };
}

export default async function Delivery({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: locale === "ru" ? "Доставка" : "Livrare",
    description:
      locale === "ru"
        ? "Информация о доставке. Быстрая и надежная доставка по всей Молдове"
        : "Informații despre livrare. Livrare rapidă și sigură în toată Moldova",
    publisher: {
      "@type": "Organization",
      name: "Gamma",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
    },
  };

  const deliveryServiceStructuredData = {
    "@context": "https://schema.org",
    "@type": "DeliveryChargeSpecification",
    appliesToDeliveryMethod: {
      "@type": "DeliveryMethod",
      name: locale === "ru" ? "Доставка" : "Livrare",
    },
    areaServed: {
      "@type": "Country",
      name: locale === "ru" ? "Молдова" : "Moldova",
    },
    eligibleTransactionVolume: {
      "@type": "PriceSpecification",
      price: "1000",
      priceCurrency: "MDL",
    },
    freeDeliveryThreshold: {
      "@type": "PriceSpecification",
      price: "1000",
      priceCurrency: "MDL",
    },
  };

  return (
    <>
      <Script
        id="delivery-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="delivery-service-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(deliveryServiceStructuredData),
        }}
      />

      <div className="max-w-[1250px] w-[90vw] mx-auto">
        {/* Add breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="py-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                {locale === "ru" ? "Главная" : "Acasă"}
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-gray-900 dark:text-gray-200">
                {locale === "ru" ? "Доставка" : "Livrare"}
              </span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-semibold mt-10">
          {locale === "ru" ? "Доставка" : "Livrare"}
        </h1>

        <div className="h-[200px] md:h-[500px] overflow-hidden rounded-xl mt-4">
          <Image
            src={locale === "ru" ? "/Доставка.png" : "/Livrare.png"}
            alt={locale === "ru" ? "Доставка" : "Livrare"}
            width={1500}
            height={1000}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        <div className="flex justify-center">
          <article className="flex py-8 px-4 sm:px-6 lg:px-8 w-full md:w-[80%] xl:w-[70%]">
            <div className="mx-auto rounded-lg overflow-hidden border p-4 border-gray-200 dark:border-gray-700">
              <div className="mt-8 space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    {locale === "ru"
                      ? "Доставка в Кишинев"
                      : "Livrare în Chișinău"}
                  </h2>
                  <p>
                    {locale === "ru"
                      ? "Доставка осуществляется в течение 1 - 7 рабочих дней с момента обработки заказа. Стоимость доставки для заказов до 1000 леев - 50 леев, для заказов свыше 1000 леев - БЕСПЛАТНО."
                      : "Se efectuează în decurs 1 - 7 zile lucrătoare de la procesarea comenzii. Costul livrării pentru comanda până la 1000 lei - 50 lei, pentru comenzile care depășesc 1000 lei - GRATUIT."}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    {locale === "ru"
                      ? "Доставка в пригороды"
                      : "Livrare în suburbii"}
                  </h2>
                  <p>
                    {locale === "ru"
                      ? "Трушены, Ватра, Гидигич, Грэтишти, Хулбоака, Стауцень, Новый Гоян, Думбрава, Дурлешть, Кодру, Бачой, Сэнджера, Бубуечи, Колоница, Тохатин, Крикова, Чореску, Вадул-луй-Водэ, Кондрита, Доброджа, Хумулешть - стоимость доставки в пригороды - 60 леев. Для заказов свыше 1000 леев - БЕСПЛАТНО."
                      : "Trușeni, Vatra, Ghidighici, Grătiești, Hulboaca, Stăuceni, Goianul Nou, Dumbrava, Durlești, Codru, Bacioi, Sangera, Bubuieci, Colonița, Tohatin, Cricova, Ciorescu, Vadul lui Vodă, Condrița, Dobrogea, Humulești - costul livrării în suburbii va fi de 60 lei. Pentru comenzile care depășesc 1000 lei - GRATUIT."}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    {locale === "ru"
                      ? "Доставка по Молдове"
                      : "Livrare în Moldova"}
                  </h2>
                  <p>
                    {locale === "ru"
                      ? "Стоимость доставки по Молдове - 60 леев. Для заказов свыше 1000 леев - БЕСПЛАТНО."
                      : "Costul livrării prin Moldova - 60 lei. Pentru comenzile care depășesc 1000 lei - GRATUIT."}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    {locale === "ru" ? "Важно!" : "Important!"}
                  </h2>
                  <p>
                    {locale === "ru"
                      ? "Заказы доставляются только до районных центров и могут занять до 7 дней."
                      : "Comanda se livrează numai până în centre raionale și poate dura până la 7 zile."}
                  </p>
                </section>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
