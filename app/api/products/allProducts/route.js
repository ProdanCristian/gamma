import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const showBestsellers = url.searchParams.get("bestsellers") === "true";
    const showDiscounted = url.searchParams.get("discounted") === "true";
    const colorId = url.searchParams.get("color");
    const brandId = url.searchParams.get("brand");

    const cacheKey = `all_products:${page}:${limit}:${minPrice || ""}:${
      maxPrice || ""
    }:${showBestsellers}:${showDiscounted}:${colorId || ""}:${
      brandId || ""
    }:${new URLSearchParams(url.searchParams).toString()}`;

    let cachedData = await cache.get(cacheKey);
    if (cachedData) {
      const productIds = cachedData.products.map((p) => p.id);

      if (productIds.length > 0) {
        const { rows: stockData } = await db.query(
          `SELECT id, "Stock" FROM public."nc_pka4__Produse" WHERE id = ANY($1)`,
          [productIds]
        );

        cachedData.products = cachedData.products.map((product) => ({
          ...product,
          Stock: stockData.find((s) => s.id === product.id)?.Stock || 0,
        }));
      }

      return NextResponse.json(cachedData);
    }

    let conditions = [`"Nume_Produs_RO" IS NOT NULL`, `"Disponibil" = true`];
    const params = [];

    if (minPrice !== null && minPrice !== undefined) {
      conditions.push(`"Pret_Standard"::numeric >= $${params.length + 1}`);
      params.push(parseFloat(minPrice));
    }

    if (maxPrice !== null && maxPrice !== undefined) {
      conditions.push(`"Pret_Standard"::numeric <= $${params.length + 1}`);
      params.push(parseFloat(maxPrice));
    }

    if (showBestsellers) {
      conditions.push(`"Bestselling" = true`);
    }

    if (showDiscounted) {
      conditions.push(
        `"Pret_Redus" IS NOT NULL AND "Pret_Redus"::numeric < "Pret_Standard"::numeric`
      );
    }

    if (colorId) {
      conditions.push(`"nc_pka4___Culori_id" = $${params.length + 1}`);
      params.push(parseInt(colorId));
    }

    if (brandId) {
      conditions.push(`"nc_pka4___Branduri_id" = $${params.length + 1}`);
      params.push(parseInt(brandId));
    }

    const attributeFilters = Object.fromEntries(
      Array.from(url.searchParams.entries())
        .filter(([key, value]) => key.startsWith("attr_") && value !== "all")
        .map(([key, value]) => [key.replace("attr_", ""), value])
    );

    Object.entries(attributeFilters).forEach(([attrId, value]) => {
      conditions.push(
        `("nc_pka4__Atribute_id" = $${
          params.length + 1
        } AND "Valoare_Atribut" = $${params.length + 2})`
      );
      params.push(parseInt(attrId), value);
    });

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * limit;

    const selectFields = `
      id, "Nume_Produs_RO", "Nume_Produs_RU", "Descriere_Produs_RO",
      "Descriere_Produs_RU", "Pret_Standard", "Pret_Redus",
      "Imagine_Principala", "imagini_Secundare", "Bestselling", "Stock",
      "Valoare_Atribut", "Video", "nc_pka4___Branduri_id",
      "nc_pka4___SubSubCategorii_id", "nc_pka4___Variante_id",
      "nc_pka4__Atribute_id", "nc_pka4___Culori_id", "Disponibil"
    `;

    const [productsResult, countResult] = await Promise.all([
      db.query(
        `SELECT ${selectFields}
         FROM public."nc_pka4__Produse" ${whereClause}
         ORDER BY id DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
      db.query(
        `SELECT COUNT(*) FROM public."nc_pka4__Produse" ${whereClause}`,
        params
      ),
    ]);

    const totalProducts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = productsResult.rows.map((product) => ({
      ...product,
      Pret_Standard: parseFloat(product.Pret_Standard),
      Pret_Redus: product.Pret_Redus ? parseFloat(product.Pret_Redus) : null,
      Stock: parseInt(product.Stock || "0"),
      imagini_Secundare: product.imagini_Secundare
        ? JSON.parse(product.imagini_Secundare)
        : [],
    }));

    const response = {
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        productsPerPage: limit,
      },
    };

    const productData = {
      ...response,
      products: products.map(({ Stock, ...product }) => product),
    };

    await cache.set(cacheKey, productData, 86400);

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
