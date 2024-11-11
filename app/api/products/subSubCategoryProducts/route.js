import { NextResponse } from "next/server";
import db from "@/lib/db";

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

    // Start with basic conditions
    let conditions = [`p."nc_pka4___SubSubCategorii_id" = $1`];
    const params = [subSubCategoryId];

    // Add price filters
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
      conditions.push(`
        p."Pret_Redus" IS NOT NULL 
        AND CAST(p."Pret_Redus" AS NUMERIC) < CAST(p."Pret_Standard" AS NUMERIC)
      `);
    }

    // Add color filter
    if (colorId) {
      conditions.push(`p."nc_pka4___Culori_id" = $${params.length + 1}`);
      params.push(parseInt(colorId));
    }

    // Add brand filter
    if (brandId) {
      conditions.push(`p."nc_pka4___Branduri_id" = $${params.length + 1}`);
      params.push(parseInt(brandId));
    }

    // Parse attribute filters
    const attributeFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("attr_") && value !== "all") {
        const attrId = key.replace("attr_", "");
        attributeFilters[attrId] = value;
      }
    }

    // Add attribute filters
    Object.entries(attributeFilters).forEach(([attrId, value]) => {
      if (value !== "all") {
        conditions.push(`
          (p."nc_pka4__Atribute_id" = $${params.length + 1} 
          AND p."Valoare_Atribut" = $${params.length + 2})
        `);
        params.push(parseInt(attrId), value);
      }
    });

    // Calculate offset
    const offset = (page - 1) * limit;

    // Main query
    const query = `
      SELECT DISTINCT
        p.id,
        p."Nume_Produs_RO",
        p."Nume_Produs_RU",
        p."Descriere_Produs_RO",
        p."Descriere_Produs_RU",
        p."Pret_Standard",
        p."Pret_Redus",
        p."Imagine_Principala",
        p."imagini_Secundare",
        p."Bestselling",
        p."Stock"
      FROM "nc_pka4__Produse" p
      WHERE ${conditions.join(" AND ")}
      ORDER BY p.id DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT p.id)
      FROM "nc_pka4__Produse" p
      WHERE ${conditions.join(" AND ")}
    `;

    // Add pagination parameters
    params.push(limit, offset);

    // Execute both queries
    const [productsResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2)),
    ]);

    const totalProducts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);

    // Transform the data
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
