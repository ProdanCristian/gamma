import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET() {
  try {
    const cacheKey = "discounted_attributes";
    let attributes = await cache.get(cacheKey);

    if (!attributes) {
      const query = `
        WITH discounted_products AS (
          SELECT DISTINCT p.id, p."nc_pka4__Atribute_id", p."Valoare_Atribut"
          FROM "nc_pka4__Produse" p
          WHERE p."Pret_Redus" IS NOT NULL 
          AND CAST(p."Pret_Redus" AS NUMERIC) < CAST(p."Pret_Standard" AS NUMERIC)
          AND p."nc_pka4__Atribute_id" IS NOT NULL
        )
        SELECT 
          a.id,
          a."Atribut_RO_",
          a."Atribut_RU_",
          ARRAY_AGG(DISTINCT dp."Valoare_Atribut") FILTER (
            WHERE dp."Valoare_Atribut" IS NOT NULL 
            AND dp."Valoare_Atribut" != ''
          ) as values
        FROM public."nc_pka4__Atribute" a
        INNER JOIN discounted_products dp ON a.id = dp."nc_pka4__Atribute_id"
        GROUP BY a.id, a."Atribut_RO_", a."Atribut_RU_"
        HAVING COUNT(DISTINCT dp."Valoare_Atribut") > 0
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
