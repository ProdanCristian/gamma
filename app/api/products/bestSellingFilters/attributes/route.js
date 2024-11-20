import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET() {
  try {
    const cacheKey = "bestselling_attributes";
    let attributes = await cache.get(cacheKey);

    if (!attributes) {
      const query = `
        WITH bestseller_products AS (
          SELECT DISTINCT p.id, p."nc_pka4__Atribute_id", p."Valoare_Atribut"
          FROM "nc_pka4__Produse" p
          WHERE p."Bestselling" = true AND p."nc_pka4__Atribute_id" IS NOT NULL
        )
        SELECT 
          a.id,
          a."Atribut_RO_",
          a."Atribut_RU_",
          ARRAY_AGG(DISTINCT bp."Valoare_Atribut") FILTER (
            WHERE bp."Valoare_Atribut" IS NOT NULL 
            AND bp."Valoare_Atribut" != ''
          ) as values
        FROM public."nc_pka4__Atribute" a
        INNER JOIN bestseller_products bp ON a.id = bp."nc_pka4__Atribute_id"
        GROUP BY a.id, a."Atribut_RO_", a."Atribut_RU_"
        HAVING COUNT(DISTINCT bp."Valoare_Atribut") > 0
        ORDER BY a.id;
      `;

      const result = await db.query(query);
      attributes = result.rows.filter(
        (attr) =>
          attr.values && Array.isArray(attr.values) && attr.values.length > 0
      );

      await cache.set(cacheKey, attributes, 3600);
    }

    return NextResponse.json({
      success: true,
      attributes,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch attributes",
      },
      { status: 500 }
    );
  }
}
