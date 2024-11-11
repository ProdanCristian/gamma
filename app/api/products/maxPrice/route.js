import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const showBestsellers = url.searchParams.get("bestsellers") === "true";
    const showDiscounted = url.searchParams.get("discounted") === "true";
    const colorId = url.searchParams.get("color");
    const brandId = url.searchParams.get("brand");

    // Start with basic conditions
    let conditions = [];
    const params = [];

    conditions.push(`"Nume_Produs_RO" IS NOT NULL`);

    if (showBestsellers) {
      conditions.push(`"Bestselling" = true`);
    }

    if (showDiscounted) {
      conditions.push(`
        "Pret_Redus" IS NOT NULL 
        AND CAST("Pret_Redus" AS NUMERIC) < CAST("Pret_Standard" AS NUMERIC)
      `);
    }

    // Parse attribute filters from URL
    const attributeFilters = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (key.startsWith("attr_") && value !== "all") {
        const attrId = key.replace("attr_", "");
        attributeFilters[attrId] = value;
      }
    }

    // Add attribute filters
    Object.entries(attributeFilters).forEach(([attrId, value]) => {
      if (value !== "all") {
        conditions.push(`
          ("nc_pka4__Atribute_id" = $${params.length + 1} 
          AND "Valoare_Atribut" = $${params.length + 2})
        `);
        params.push(parseInt(attrId), value);
      }
    });

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

    // Combine conditions
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT CEIL(MAX(CAST("Pret_Standard" AS NUMERIC))) as max_price
      FROM public."nc_pka4__Produse"
      ${whereClause}
    `;

    const result = await db.query(query, params);
    const maxPrice = parseInt(result.rows[0].max_price) || 50000;

    return NextResponse.json({
      success: true,
      maxPrice,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch max price",
      },
      { status: 500 }
    );
  }
}
