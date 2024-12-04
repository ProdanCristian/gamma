import Image from "next/image";
import Script from "next/script";
import Link from "next/link";

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "ro" }];
}

export async function generateMetadata(props) {
  const { params } = props;
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  const title = locale === "ru" ? "О Gamma" : "Despre Gamma";
  const description =
    locale === "ru"
      ? "Узнайте больше о Gamma - вашем надежном партнере в онлайн-шопинге в Молдове. Качественные товары, отличный сервис и быстрая доставка."
      : "Aflați mai multe despre Gamma - partenerul dvs. de încredere în cumpărături online în Moldova. Produse de calitate, servicii excelente și livrare rapidă.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale,
      siteName: "Gamma",
      images: [
        {
          url: locale === "ru" ? "/О-нас.webp" : "/Despre.webp",
          width: 1920,
          height: 1000,
          alt: locale === "ru" ? "О Gamma" : "Despre Gamma",
        },
      ],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/about`,
      languages: {
        ru: "/ru/about",
        ro: "/ro/about",
      },
    },
  };
}

export default async function About(props) {
  const { params } = props;
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: locale === "ru" ? "О Gamma" : "Despre Gamma",
    description:
      locale === "ru"
        ? "Узнайте больше о Gamma - вашем надежном партнере в онлайн-шопинге в Молдове"
        : "Aflați mai multe despre Gamma - partenerul dvs. de încredere în cumpărături online în Moldova",
    publisher: {
      "@type": "Organization",
      name: "Gamma",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
    },
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Gamma",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
    description:
      locale === "ru"
        ? "Ведущий онлайн-магазин в Молдове, предлагающий широкий ассортимент качественных товаров"
        : "Magazin online de top din Moldova, oferind o gamă largă de produse de calitate",
    foundingDate: "2023",
    address: {
      "@type": "PostalAddress",
      addressCountry: "Moldova",
    },
  };

  return (
    <>
      <Script
        id="about-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
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
                {locale === "ru" ? "О нас" : "Despre noi"}
              </span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-semibold mt-10">
          {locale === "ru" ? "О Gamma" : "Despre Gamma"}
        </h1>

        <div className="h-[200px] md:h-[500px] overflow-hidden rounded-xl mt-4">
          <Image
            src={locale === "ru" ? "/О-нас.webp" : "/Despre.webp"}
            alt={locale === "ru" ? "О Gamma" : "Despre Gamma"}
            width={1920}
            height={2000}
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
                      ? "Добро пожаловать в Gamma"
                      : "Bine ați venit la Gamma"}
                  </h2>
                  <p>
                    {locale === "ru"
                      ? "Добро пожаловать в Gamma, самый новый и динамичный онлайн-рынок Молдовы! Мы гордимся тем, что предлагаем удобный и доступный шопинг для всех молдаван, объединяя огромное разнообразие товаров – от повседневных предметов до уникальных и высококачественных продуктов."
                      : "Bine ați venit la Gamma, cea mai nouă și dinamică piață online din Moldova! Suntem mândri să oferim o experiență de cumpărături comodă și accesibilă pentru toți moldovenii, aducând la un loc o varietate imensă de produse – de la articole de zi cu zi, până la produse unice și de înaltă calitate."}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    {locale === "ro" ? "Povestea noastră" : "Наша история"}
                  </h2>
                  <p>
                    {locale === "ro"
                      ? "Povestea Gamma a început cu o viziune simplă: aceea de a construi un spațiu online unde orice persoană să poată găsi exact ce are nevoie, indiferent de preferințe și buget. Am pornit cu dorința de a face cumpărăturile mai accesibile, mai rapide și mai plăcute pentru toți. Cu un singur click, locuitorii din Moldova pot explora o varietate enormă de produse, descoperind totul într-un singur loc."
                      : "История Gamma началась с простого видения: создать онлайн-пространство, где каждый человек может найти именно то, что ему нужно, независимо от предпочтений и бюджета. Мы начали с желания сделать покупки более доступными, быстрыми и приятными для всех. Одним кликом жители Молдовы могут исследовать огромное разнообразие товаров, находя всё в одном месте."}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    {locale === "ro"
                      ? "Angajamentul nostru pentru calitate"
                      : "Наше обязательство качества"}
                  </h2>
                  <p>
                    {locale === "ro"
                      ? "Fie că este vorba de articole pentru casă, modă, tehnologie sau produse pentru îngrijire personală, la Gamma ne angajăm să aducem pe piață doar produse de calitate, selectate cu atenție pentru a răspunde nevoilor clienților noștri. Colaborăm cu furnizori de încredere, atât locali, cât și internaționali, asigurându-ne că fiecare produs este la standarde înalte și disponibil la prețuri competitive."
                      : "Будь то товары для дома, мода, технологии или средства личной гигиены, в Gamma мы стремимся предлагать только качественные продукты, тщательно отобранные для удовлетворения потребностей наших клиентов. Мы сотрудничаем с надежными поставщиками, как местными, так и международными, гарантируя, что каждый продукт соответствует высоким стандартам и доступен по конкурентным ценам."}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    {locale === "ro"
                      ? "Mai mult decât un magazin"
                      : "Больше, чем магазин"}
                  </h2>
                  <p>
                    {locale === "ro"
                      ? "La Gamma, suntem mai mult decât un simplu magazin online – suntem o echipă dedicată comunității noastre și ne propunem să oferim o experiență de cumpărături de neuitat. Cu fiecare comandă, sperăm să devenim parte din viața fiecărui client, oferindu-i produse care îi aduc bucurie și satisfacție."
                      : "В Gamma мы больше, чем просто онлайн-магазин – мы команда, преданная нашему сообществу, и мы стремимся предоставить незабываемый опыт покупок. С каждым заказом мы надеемся стать частью жизни каждого клиента, предлагая продукты, которые приносят радость и удовлетворение."}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    {locale === "ro"
                      ? "Alăturați-vă comunității noastre"
                      : "Присоединяйтесь к нашему сообществу"}
                  </h2>
                  <p>
                    {locale === "ro"
                      ? "Vă invităm să descoperiți tot ce oferim și să faceți parte din povestea noastră. La Gamma, credem că împreună putem crea o comunitate de cumpărători care să inspire încredere, entuziasm și satisfacție. Sunteți gata să începeți călătoria cu Gamma?"
                      : "Приглашаем вас открыть для себя всё, что мы предлагаем, и стать частью нашей истории. В Gamma мы верим, что вместе мы можем создать сообщество покупателей, вдохновляющее доверие, энтузиазм и удовлетворение. Готовы начать путешествие с Gamma?"}
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
