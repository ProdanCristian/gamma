import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subSubCategoryId = searchParams.get("subSubCategoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const showBestsellers = searchParams.get("bestsellers") === "true";
    const showDiscounted = searchParams.get("discounted") === "true";
    const colorId = searchParams.get("color");
    const brandId = searchParams.get("brand");

    if (!subSubCategoryId) {
      return NextResponse.json(
        { error: "SubSubCategory ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `subsubcategory:${subSubCategoryId}:${page}:${limit}:${
      minPrice || ""
    }:${maxPrice || ""}:${showBestsellers}:${showDiscounted}:${colorId || ""}:${
      brandId || ""
    }:${new URLSearchParams(searchParams).toString()}`;

    let cachedData = await cache.get(cacheKey);

    if (!cachedData) {
      const conditions = [
        `p."nc_pka4___SubSubCategorii_id" = $1`,
        `p."Disponibil" = true`,
      ];
      const params = [subSubCategoryId];

      if (minPrice !== null && minPrice !== undefined) {
        conditions.push(`p."Pret_Standard"::numeric >= $${params.length + 1}`);
        params.push(parseFloat(minPrice));
      }

      if (maxPrice !== null && maxPrice !== undefined) {
        conditions.push(`p."Pret_Standard"::numeric <= $${params.length + 1}`);
        params.push(parseFloat(maxPrice));
      }

      if (showBestsellers) {
        conditions.push(`p."Bestselling" = true`);
      }

      if (showDiscounted) {
        conditions.push(
          `p."Pret_Redus" IS NOT NULL AND p."Pret_Redus"::numeric < p."Pret_Standard"::numeric`
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

      if (Object.keys(attributeFilters).length > 0) {
        const attrConditions = Object.entries(attributeFilters).map(
          ([attrId, value]) => {
            params.push(parseInt(attrId), value);
            return `(p."nc_pka4__Atribute_id" = $${
              params.length - 1
            } AND p."Valoare_Atribut" = $${params.length})`;
          }
        );
        conditions.push(`(${attrConditions.join(" OR ")})`);
      }

      const offset = (page - 1) * limit;
      params.push(limit, offset);

      const [productsResult, countResult] = await Promise.all([
        db.query(
          `SELECT DISTINCT
            p.id,
            p."Nume_Produs_RO",
            p."Nume_Produs_RU",
            p."Descriere_Produs_RO",
            p."Descriere_Produs_RU",
            p."Pret_Standard"::numeric,
            p."Pret_Redus"::numeric,
            p."Imagine_Principala",
            p."imagini_Secundare",
            p."Bestselling",
            p."Disponibil"
          FROM "nc_pka4__Produse" p
          WHERE ${conditions.join(" AND ")}
          ORDER BY p.id DESC
          LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        ),
        db.query(
          `SELECT COUNT(DISTINCT p.id)
           FROM "nc_pka4__Produse" p
           WHERE ${conditions.join(" AND ")}`,
          params.slice(0, -2)
        ),
      ]);

      const totalProducts = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalProducts / limit);

      const products = productsResult.rows.map((product) => ({
        ...product,
        imagini_Secundare: product.imagini_Secundare
          ? JSON.parse(product.imagini_Secundare)
          : [],
      }));

      cachedData = {
        success: true,
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          productsPerPage: limit,
        },
      };

      await cache.set(cacheKey, cachedData, 86400);
    }

    if (cachedData.products?.length) {
      const productIds = cachedData.products.map((p) => p.id);
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
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching products", details: error.message },
      { status: 500 }
    );
  }
}
