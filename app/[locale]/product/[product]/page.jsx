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
import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import YouTubeFacade from "@/components/ProductPage/YouTubeFacade";
import Image from "next/image";

async function getProduct(productId) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
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

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const product = resolvedParams.product;
  const locale = resolvedParams.locale;
  const state = resolvedSearchParams.state;

  const productId = product.split("_")[1];

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
    return {
      title: "Product Not Found",
    };
  }

  const productName =
    locale === "ru"
      ? productData.data.Nume_Produs_RU
      : productData.data.Nume_Produs_RO;

  const description =
    locale === "ru"
      ? productData.data.Descriere_Produs_RU
      : productData.data.Descriere_Produs_RO;

  return {
    title: `${productName} | ${productData.data.brand_name || "Shop"}`,
    description: description,
    keywords: `${productName}, ${productData.data.brand_name}, ${
      locale === "ru" ? "купить онлайн" : "cumpără online"
    }`,
    openGraph: {
      title: productName,
      description: description,
      images: [
        productData.data.mainImage ||
          JSON.parse(productData.data.Imagine_Principala)[0],
      ],
      type: "website",
      locale: locale,
      siteName: locale === "ru" ? "Ваш магазин" : "Magazinul Dvs",
    },
    twitter: {
      card: "summary_large_image",
      title: productName,
      description: description,
      images: [
        productData.data.mainImage ||
          JSON.parse(productData.data.Imagine_Principala)[0],
      ],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/product/${product}`,
      languages: {
        "ru-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ru/product/${product}`,
        "ro-MD": `${process.env.NEXT_PUBLIC_BASE_URL}/ro/product/${product}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export default async function ProductPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const product = resolvedParams.product;
  const locale = resolvedParams.locale;
  const state = resolvedSearchParams.state;

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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name:
      locale === "ru"
        ? productData.data.Nume_Produs_RU
        : productData.data.Nume_Produs_RO,
    description:
      locale === "ru"
        ? productData.data.Descriere_Produs_RU
        : productData.data.Descriere_Produs_RO,
    image: allImages,
    sku: productId,
    mpn: productId,
    brand: {
      "@type": "Brand",
      name: productData.data.brand_name,
    },
    offers: {
      "@type": "Offer",
      price: productData.data.Pret_Redus || productData.data.Pret,
      priceCurrency: "MDL",
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product}`,
      ...(productData.data.Pret_Redus && {
        priceSpecification: {
          "@type": "PriceSpecification",
          price: productData.data.Pret,
          priceCurrency: "MDL",
        },
      }),
    },
    ...(productData.data.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: productData.data.rating,
        reviewCount: productData.data.reviewCount,
      },
    }),
    category: productData.data.category_name,
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "ru" ? "Главная" : "Acasă",
        item: process.env.NEXT_PUBLIC_BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name:
          locale === "ru"
            ? productData.data.Nume_Produs_RU
            : productData.data.Nume_Produs_RO,
        item: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${product}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="product-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

      <Script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: locale === "ru" ? "Ваш магазин" : "Magazinul Dvs",
            url: process.env.NEXT_PUBLIC_BASE_URL,
            logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
          }),
        }}
      />

      <main className="my-6 min-h-screen max-w-[1250px] w-[90vw] mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="mb-4"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <Link
                href="/"
                className="hover:text-gray-900 dark:hover:text-gray-200"
                itemProp="item"
              >
                <span itemProp="name">
                  {locale === "ru" ? "Главная" : "Home"}
                </span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li>/</li>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <span
                className="text-gray-900 dark:text-gray-200"
                itemProp="name"
              >
                {locale === "ru"
                  ? productData.data.Nume_Produs_RU
                  : productData.data.Nume_Produs_RO}
              </span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        <div>
          <div className="flex flex-col lg:flex-row gap-10 justify-between mt-6">
            <article className="lg:w-[40%]">
              <ProductCarousel
                images={allImages}
                altText={
                  locale === "ru"
                    ? productData.data.Nume_Produs_RU
                    : productData.data.Nume_Produs_RO
                }
              />
              {videos.length > 0 && (
                <div className="mt-20 space-y-4 pt-16 border-t border-gray-200 dark:border-charade-700">
                  {videos.map((videoUrl, index) => {
                    const videoId = videoUrl.split("v=")[1];
                    const videoTitle = `${
                      locale === "ru"
                        ? productData.data.Nume_Produs_RU
                        : productData.data.Nume_Produs_RO
                    } - Video ${index + 1}`;

                    return (
                      <YouTubeFacade
                        key={index}
                        videoId={videoId}
                        title={videoTitle}
                      />
                    );
                  })}
                </div>
              )}
            </article>

            <div className="lg:w-[50%]">
              <div className="space-y-2">
                {productData.data.brand_name && (
                  <div className="mb-2 text-gray-600 dark:text-gray-400 text-lg">
                    {productData.data.brand_name}
                  </div>
                )}
                <h1 className="dark:text-white text-charade-950 font-semibold text-4xl min-h-[48px]">
                  {locale === "ru"
                    ? productData.data.Nume_Produs_RU
                    : productData.data.Nume_Produs_RO}
                </h1>
              </div>

              <ul>
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
                  <div className="relative w-64 h-16">
                    <img
                      src="/Payments.png"
                      alt="Payments"
                      className="absolute inset-0 w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {similarProducts?.success && similarProducts.data.length > 0 && (
            <section className="my-20">
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
            </section>
          )}
        </div>
      </main>
    </>
  );
}
