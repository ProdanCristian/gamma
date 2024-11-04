export const dynamic = "force-dynamic";
import ImageCarousel from "@/components/ImageCarousel";
import TopCategories from "@/components/TopCategories";
import DiscountedProducts from "@/components/Shop/DiscoutedProducts";
import BestSellingProducts from "@/components/Shop/BestSellingProducts";

async function getSliders() {
  try {
    const baseUrl = "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/marketingDesign`);

    if (!res.ok) {
      console.log("Response not OK:", res.status);
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
    const baseUrl = "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/topCategories`);
    const data = await response.json();
    return data.success ? data.categories : [];
  } catch (error) {
    console.error("Error fetching top categories:", error);
    return [];
  }
}

export default async function Page({ params }) {
  const [{ locale }, marketingData, topCategories] = await Promise.all([
    params,
    getSliders(),
    getTopCategories(),
  ]);

  const sliders =
    locale === "ru"
      ? marketingData?.Bannere_Slider_RU_
      : marketingData?.Bannere_Slider_RO_;

  if (!marketingData) {
    console.log("No marketing data found");
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
    </main>
  );
}

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "ro" }];
}
