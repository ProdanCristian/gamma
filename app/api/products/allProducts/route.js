import { NextResponse } from "next/server";
import db from "@/lib/db";

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

    const selectFields = `
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
    `;

    // Start with basic conditions
    let conditions = [];
    const params = [];

    // Add essential conditions first
    conditions.push(`"Nume_Produs_RO" IS NOT NULL`);

    // Add price filters - cast string to numeric for comparison
    if (minPrice !== null && minPrice !== undefined) {
      conditions.push(
        `CAST("Pret_Standard" AS NUMERIC) >= $${params.length + 1}`
      );
      params.push(parseFloat(minPrice));
    }

    if (maxPrice !== null && maxPrice !== undefined) {
      conditions.push(
        `CAST("Pret_Standard" AS NUMERIC) <= $${params.length + 1}`
      );
      params.push(parseFloat(maxPrice));
    }

    if (showBestsellers) {
      conditions.push(`"Bestselling" = true`);
    }

    if (showDiscounted) {
      conditions.push(`
        "Pret_Redus" IS NOT NULL 
        AND CAST("Pret_Redus" AS NUMERIC) < CAST("Pret_Standard" AS NUMERIC)
      `);
    }

    // Add color filter
    if (colorId) {
      conditions.push(`"nc_pka4___Culori_id" = $${params.length + 1}`);
      params.push(parseInt(colorId));
    }

    // Add brand filter
    if (brandId) {
      conditions.push(`"nc_pka4___Branduri_id" = $${params.length + 1}`);
      params.push(parseInt(brandId));
    }

    // Parse attribute filters from URL
    const attributeFilters = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (key.startsWith("attr_") && value !== "all") {
        const attrId = key.replace("attr_", "");
        attributeFilters[attrId] = value;
      }
    }

    // Add attribute filters only if they're not "all"
    Object.entries(attributeFilters).forEach(([attrId, value]) => {
      if (value !== "all") {
        conditions.push(`
          ("nc_pka4__Atribute_id" = $${params.length + 1} 
          AND "Valoare_Atribut" = $${params.length + 2})
        `);
        params.push(parseInt(attrId), value);
      }
    });

    // Combine conditions
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Calculate offset
    const offset = (page - 1) * limit;

    // Main query for products
    const query = `
      SELECT ${selectFields}
      FROM public."nc_pka4__Produse"
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) 
      FROM public."nc_pka4__Produse"
      ${whereClause}
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

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        productsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    console.error("Full error details:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch products",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
