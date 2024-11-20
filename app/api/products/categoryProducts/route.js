import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const showBestsellers = searchParams.get("bestsellers") === "true";
    const showDiscounted = searchParams.get("discounted") === "true";
    const colorId = searchParams.get("color");
    const brandId = searchParams.get("brand");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `category:${categoryId}:${page}:${limit}:${
      minPrice || ""
    }:${maxPrice || ""}:${showBestsellers}:${showDiscounted}:${colorId || ""}:${
      brandId || ""
    }:${new URLSearchParams(searchParams).toString()}`;

    let cachedData = await cache.get(cacheKey);
    if (cachedData) {
      const productIds = cachedData.products.map((p) => p.id);
      const { rows: stockData } = await db.query(
        `SELECT id, "Stock" FROM public."nc_pka4__Produse" WHERE id = ANY($1)`,
        [productIds]
      );

      cachedData.products = cachedData.products.map((product) => ({
        ...product,
        Stock: stockData.find((s) => s.id === product.id)?.Stock || 0,
      }));

      return NextResponse.json(cachedData);
    }

    let conditions = [`c.id = $1`];
    const params = [categoryId];

    if (minPrice !== null && minPrice !== undefined) {
      conditions.push(
        `CAST(p."Pret_Standard" AS NUMERIC) >= $${params.length + 1}`
      );
      params.push(parseFloat(minPrice));
    }

    if (maxPrice !== null && maxPrice !== undefined) {
      conditions.push(
        `CAST(p."Pret_Standard" AS NUMERIC) <= $${params.length + 1}`
      );
      params.push(parseFloat(maxPrice));
    }

    if (showBestsellers) {
      conditions.push(`p."Bestselling" = true`);
    }

    if (showDiscounted) {
      conditions.push(
        `p."Pret_Redus" IS NOT NULL AND CAST(p."Pret_Redus" AS NUMERIC) < CAST(p."Pret_Standard" AS NUMERIC)`
      );
    }

    if (colorId) {
      conditions.push(`p."nc_pka4___Culori_id" = $${params.length + 1}`);
      params.push(parseInt(colorId));
    }

    if (brandId) {
      conditions.push(`p."nc_pka4___Branduri_id" = $${params.length + 1}`);
      params.push(parseInt(brandId));
    }

    const attributeFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("attr_") && value !== "all") {
        const attrId = key.replace("attr_", "");
        attributeFilters[attrId] = value;
      }
    }

    Object.entries(attributeFilters).forEach(([attrId, value]) => {
      if (value !== "all") {
        conditions.push(
          `(p."nc_pka4__Atribute_id" = $${
            params.length + 1
          } AND p."Valoare_Atribut" = $${params.length + 2})`
        );
        params.push(parseInt(attrId), value);
      }
    });

    const offset = (page - 1) * limit;

    const [productsResult, countResult] = await Promise.all([
      db.query(
        `
        SELECT DISTINCT
          p.id, p."Nume_Produs_RO", p."Nume_Produs_RU", p."Descriere_Produs_RO",
          p."Descriere_Produs_RU", p."Pret_Standard", p."Pret_Redus",
          p."Imagine_Principala", p."imagini_Secundare", p."Bestselling", p."Stock"
        FROM "nc_pka4__Produse" p
        JOIN "nc_pka4___SubSubCategorii" ssc ON p."nc_pka4___SubSubCategorii_id" = ssc.id
        JOIN "nc_pka4___SubCategorii" sc ON ssc."nc_pka4___SubCategorii_id" = sc.id
        JOIN "nc_pka4___Categorii" c ON sc."nc_pka4___Categorii_id" = c.id
        WHERE ${conditions.join(" AND ")}
        ORDER BY p.id DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
        [...params, limit, offset]
      ),
      db.query(
        `
        SELECT COUNT(DISTINCT p.id)
        FROM "nc_pka4__Produse" p
        JOIN "nc_pka4___SubSubCategorii" ssc ON p."nc_pka4___SubSubCategorii_id" = ssc.id
        JOIN "nc_pka4___SubCategorii" sc ON ssc."nc_pka4___SubCategorii_id" = sc.id
        JOIN "nc_pka4___Categorii" c ON sc."nc_pka4___Categorii_id" = c.id
        WHERE ${conditions.join(" AND ")}
      `,
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

    await cache.set(cacheKey, response, 3600);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error fetching products",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
