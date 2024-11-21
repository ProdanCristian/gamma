export const revalidate = false;

import ImageCarousel from "@/components/ImageCarousel";
import TopCategories from "@/components/TopCategories";
import DiscountedProducts from "@/components/Shop/DiscoutedProducts";
import BestSellingProducts from "@/components/Shop/BestSellingProducts";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

async function getSliders() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/marketingDesign`, {
      next: { tags: ["marketing"] },
      cache: "force-cache",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.success ? data.data[0] : null;
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return null;
  }
}

async function getTopCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const response = await fetch(`${baseUrl}/api/topCategories`, {
      next: { tags: ["categories"] },
      cache: "force-cache",
    });
    const data = await response.json();
    return data.success ? data.categories : [];
  } catch (error) {
    console.error("Error fetching top categories:", error);
    return [];
  }
}

export default async function Page({ params }) {
  const t = await getTranslations("home");
  const [{ locale }, marketingData, topCategories] = await Promise.all([
    params,
    getSliders(),
    getTopCategories(),
  ]);

  const sliders =
    locale === "ru"
      ? marketingData?.Bannere_Slider_RU_
      : marketingData?.Bannere_Slider_RO_;

  const banner3 =
    locale === "ru"
      ? marketingData?.Banner3_RU_[0]
      : marketingData?.Banner3_RO_[0];

  if (!marketingData) {
    return null;
  }

  return (
    <main>
      <div className="max-w-[1250px] w-[90vw] mx-auto">
        <div className="w-full flex mt-5">
          <div className="hidden lg:block w-[460px]"></div>
          <div className="w-full">
            <ImageCarousel sliders={sliders || []} />
          </div>
        </div>
      </div>
      <TopCategories categories={topCategories} />
      <DiscountedProducts marketingData={marketingData} />
      <BestSellingProducts marketingData={marketingData} />
      <div className="max-w-[1250px] w-[90vw] mx-auto mt-10">
        <div className="w-full h-[125px] lg:h-[250px] relative">
          {banner3 && (
            <Image
              src={banner3}
              alt="Gamma Livrare Gratuita"
              className="rounded-xl"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          )}
        </div>
        <p className="text-center  text-gray-500 mt-5 text-base">
          {t("free_delivery_info")}
        </p>
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "ro" }];
}
