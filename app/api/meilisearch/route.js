import { NextResponse } from "next/server";
import db from "@/lib/db";
import { meilisearchClient } from "@/lib/meilisearch";

export async function POST(request) {
  try {
    const query = `
      SELECT 
        id,
        "Nume_Produs_RO",
        "Nume_Produs_RU",
        "Descriere_Produs_RO",
        "Descriere_Produs_RU",
        "Pret_Standard",
        "Pret_Redus",
        "Imagine_Principala",
        "imagini_Secundare",
        "Bestselling",
        "Stock",
        "Valoare_Atribut",
        "Video",
        "nc_pka4___Branduri_id",
        "nc_pka4___SubSubCategorii_id",
        "nc_pka4___Variante_id",
        "nc_pka4__Atribute_id",
        "nc_pka4___Culori_id"
      FROM public."nc_pka4__Produse"
      WHERE "Nume_Produs_RO" IS NOT NULL
      AND id IS NOT NULL
      LIMIT 1000
    `;

    const { rows: products } = await db.query(query);
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("No valid products retrieved from database");
    }

    const transformedProducts = products
      .map((product) => {
        try {
          return {
            id: product.id,
            name_ro: product.Nume_Produs_RO?.trim() || "",
            name_ru: product.Nume_Produs_RU?.trim() || "",
            description_ro: product.Descriere_Produs_RO?.trim() || "",
            description_ru: product.Descriere_Produs_RU?.trim() || "",
            price: parseFloat(product.Pret_Standard) || 0,
            discounted_price: product.Pret_Redus
              ? parseFloat(product.Pret_Redus)
              : null,
            main_image: product.Imagine_Principala || "",
            secondary_images: (() => {
              try {
                return product.imagini_Secundare
                  ? JSON.parse(product.imagini_Secundare)
                  : [];
              } catch {
                return [];
              }
            })(),
            is_bestseller: Boolean(product.Bestselling),
            stock: parseInt(product.Stock || "0", 10),
            attribute_value: product.Valoare_Atribut || "",
            video: product.Video || "",
            brand_id: product.nc_pka4___Branduri_id,
            subcategory_id: product.nc_pka4___SubSubCategorii_id,
            variant_id: product.nc_pka4___Variante_id,
            attribute_id: product.nc_pka4__Atribute_id,
            color_id: product.nc_pka4___Culori_id,
            has_discount: Boolean(product.Pret_Redus),
            discount_percentage: product.Pret_Redus
              ? Math.round(
                  ((parseFloat(product.Pret_Standard) -
                    parseFloat(product.Pret_Redus)) /
                    parseFloat(product.Pret_Standard)) *
                    100
                )
              : 0,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const index = meilisearchClient.index("products");
    await index.deleteAllDocuments();

    const batchSize = 100;
    for (let i = 0; i < transformedProducts.length; i += batchSize) {
      const batch = transformedProducts.slice(i, i + batchSize);
      await index.addDocuments(batch);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const stats = await index.getStats();

    return NextResponse.json({
      success: true,
      message: "Products indexed successfully",
      totalIndexed: transformedProducts.length,
      stats: stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to index products",
        details: error.stack,
        context: {
          meilisearchHost: process.env.NEXT_PUBLIC_MEILISEARCH_HOST,
          hasKey: !!process.env.NEXT_PUBLIC_MEILISEARCH_KEY,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const showBestsellers = url.searchParams.get("bestsellers") === "true";
    const showDiscounted = url.searchParams.get("discounted") === "true";
    const colorId = url.searchParams.get("color");
    const brandId = url.searchParams.get("brand");

    const index = meilisearchClient.index("products");
    const filterConditions = [];

    if (minPrice) filterConditions.push(`price >= ${minPrice}`);
    if (maxPrice) filterConditions.push(`price <= ${maxPrice}`);
    if (showBestsellers) filterConditions.push("is_bestseller = true");
    if (showDiscounted) filterConditions.push("has_discount = true");
    if (colorId) filterConditions.push(`color_id = ${colorId}`);
    if (brandId) filterConditions.push(`brand_id = ${brandId}`);

    const searchConfig = {
      limit,
      offset: (page - 1) * limit,
      filter: filterConditions.length > 0 ? filterConditions : undefined,
      sort: ["price:asc"],
      attributesToRetrieve: [
        "id",
        "name_ro",
        "name_ru",
        "price",
        "discounted_price",
        "main_image",
        "secondary_images",
        "is_bestseller",
        "has_discount",
        "discount_percentage",
        "stock",
        "attribute_value",
        "video",
      ],
    };

    const results = await index.search(query, searchConfig);
    const transformedHits = results.hits.map((hit) => {
      let mainImage;
      try {
        const imageData =
          typeof hit.main_image === "string"
            ? JSON.parse(hit.main_image)
            : hit.main_image;

        mainImage =
          Array.isArray(imageData) && imageData.length > 0
            ? imageData[0].path.startsWith("/")
              ? imageData[0].path
              : `/${imageData[0].path}`
            : typeof imageData === "object" && imageData?.path
            ? imageData.path.startsWith("/")
              ? imageData.path
              : `/${imageData.path}`
            : imageData;
      } catch {
        mainImage = hit.main_image;
      }

      return {
        ...hit,
        price: parseFloat(hit.price) || 0,
        discounted_price: hit.discounted_price
          ? parseFloat(hit.discounted_price)
          : null,
        has_discount: Boolean(hit.discounted_price),
        discount_percentage: hit.discount_percentage || 0,
        main_image: mainImage || "/placeholder-image.jpg",
        secondary_images: Array.isArray(hit.secondary_images)
          ? hit.secondary_images.map((img) => {
              const path = img.path || img;
              return path.startsWith("/") ? path : `/${path}`;
            })
          : [],
        is_bestseller: Boolean(hit.is_bestseller),
        video: hit.video || null,
      };
    });

    return NextResponse.json({
      success: true,
      hits: transformedHits,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(results.estimatedTotalHits / limit),
        totalHits: results.estimatedTotalHits,
        productsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to search products",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID required",
        },
        { status: 400 }
      );
    }

    const query = `
      SELECT *
      FROM public."nc_pka4__Produse"
      WHERE id = $1
    `;

    const { rows } = await db.query(query, [productId]);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    const product = rows[0];
    const transformedProduct = {
      id: product.id,
      name_ro: product.Nume_Produs_RO,
      name_ru: product.Nume_Produs_RU,
    };

    const index = meilisearchClient.index("products");
    await index.updateDocuments([transformedProduct]);

    return NextResponse.json({
      success: true,
      message: "Product reindexed successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
