export const dynamic = "force-dynamic";
import React from "react";
import { notFound } from "next/navigation";
import AnimatedHeart from "@/components/ProductPage/AnimatedHeart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductCarousel from "@/components/ProductPage/ProductCarousel";
import ProductDescription from "@/components/ProductPage/ProductDescription";
import ProductCard from "@/components/Shop/ProductCard";

async function getProduct(productId) {
  try {
    const baseUrl = "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products/product?id=${productId}`);

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function getProductVariants(variantId) {
  try {
    const baseUrl = "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/products/productVariants?id=${variantId}`
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching product variants:", error);
    return null;
  }
}

async function getSimilarProducts(subSubCategoryId) {
  try {
    const baseUrl = "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/products/similarProducts?id=${subSubCategoryId}`
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return null;
  }
}

export default async function ProductPage({ params, searchParams }) {
  const { product, locale } = await params;
  const { state } = await searchParams;

  const productId = product.split("_")[1];

  if (!productId) {
    notFound();
  }

  let productData;
  if (state) {
    try {
      productData = {
        success: true,
        data: JSON.parse(state),
      };
    } catch (error) {
      console.error("Error parsing state data:", error);
    }
  }

  if (!productData?.success) {
    productData = await getProduct(productId);
  }

  if (!productData?.success || !productData.data) {
    notFound();
  }

  let variantsData = null;
  if (productData?.data?.nc_pka4___Variante_id) {
    variantsData = await getProductVariants(
      productData.data.nc_pka4___Variante_id
    );
  }

  let similarProducts = null;
  if (productData?.data?.nc_pka4___SubSubCategorii_id) {
    similarProducts = await getSimilarProducts(
      productData.data.nc_pka4___SubSubCategorii_id
    );
  }

  const mainImage =
    productData.data.mainImage ||
    (productData.data.Imagine_Principala
      ? JSON.parse(productData.data.Imagine_Principala)[0]
      : null);

  const secondaryImages =
    productData.data.secondaryImages ||
    (productData.data.imagini_Secundare
      ? JSON.parse(productData.data.imagini_Secundare)
      : []);

  const allImages = [mainImage, ...secondaryImages];
  const videos = productData.data.Video ? [productData.data.Video] : [];

  return (
    <main className="my-6 min-h-screen max-w-[1250px] w-[90vw] mx-auto">
      <div>
        <div className="flex flex-col lg:flex-row gap-10 justify-between mt-6">
          <div className="lg:w-[40%]">
            <ProductCarousel images={allImages} />
            {videos.length > 0 && (
              <div className="mt-20 space-y-4 pt-16 border-t border-charade-700">
                {videos.map((videoUrl, index) => {
                  const videoId = videoUrl.split("v=")[1];
                  return (
                    <div key={index} className="relative pb-[56.25%] h-0">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Product video ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:w-[50%]">
            <ul>
              {productData.data.brand_name && (
                <p className="mb-2 text-gray-600 dark:text-gray-400 text-lg">
                  {productData.data.brand_name}
                </p>
              )}
              <li className="dark:text-white text-charade-950 font-semibold text-4xl min-h-[48px]">
                <h1>
                  {locale === "ru"
                    ? productData.data.Nume_Produs_RU
                    : productData.data.Nume_Produs_RO}
                </h1>
              </li>

              <li className="border-t py-8 min-h-[200px] dark:border-charade-700">
                <p className="text-gray-600 dark:text-gray-300 font-normal text-base">
                  {locale === "ru"
                    ? productData.data.Descriere_Produs_RU
                    : productData.data.Descriere_Produs_RO}
                </p>
                {productData.data.Bestselling && (
                  <div className="flex items-center gap-2 mt-4 text-yellow-300">
                    <AnimatedHeart />
                    <span className="font-medium">
                      {locale === "ru"
                        ? [
                            "Популярный продукт",
                            "Востребованный продукт",
                            "Самый продаваемый продукт",
                            "Модный продукт",
                          ][Math.floor(Math.random() * 4)]
                        : [
                            "Produs popular",
                            "Produs apreciat",
                            "Cel mai vândut produs",
                            "Produs în vogă",
                          ][Math.floor(Math.random() * 4)]}
                    </span>
                  </div>
                )}
              </li>

              <li className="min-h-[40px]">
                <ProductDescription
                  productData={productData.data}
                  variantsData={variantsData?.data || []}
                  locale={locale}
                />
              </li>

              <li className="border-t w-full pt-8 mt-8 dark:border-charade-700" />
              <li className="flex bg-gray-100 rounded-lg p-1 justify-center">
                <img src="/Payments.png" alt="Payments" className="w-64" />
              </li>
            </ul>
          </div>
        </div>

        {similarProducts?.success && similarProducts.data.length > 0 && (
          <div className="my-20 ">
            <h2 className="text-2xl font-semibold mb-6">
              {locale === "ru" ? "Похожие товары" : "Produse similare"}
            </h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="w-[80%] md:w-full">
                {similarProducts.data.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="md:basis-1/4 lg:basis-1/5 "
                  >
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        )}
      </div>
    </main>
  );
}
