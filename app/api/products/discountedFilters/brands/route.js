import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET() {
  try {
    const cacheKey = "discounted_brands";
    let brands = await cache.get(cacheKey);

    if (!brands) {
      const query = `
        WITH discounted_products AS (
          SELECT DISTINCT p.id, p."nc_pka4___Branduri_id"
          FROM "nc_pka4__Produse" p
          WHERE p."Pret_Redus" IS NOT NULL 
          AND CAST(p."Pret_Redus" AS NUMERIC) < CAST(p."Pret_Standard" AS NUMERIC)
          AND p."nc_pka4___Branduri_id" IS NOT NULL
        )
        SELECT 
          b.id,
          b."Denumire_Brand"
        FROM public."nc_pka4___Branduri" b
        INNER JOIN discounted_products dp ON b.id = dp."nc_pka4___Branduri_id"
        WHERE b."Denumire_Brand" IS NOT NULL
        GROUP BY b.id, b."Denumire_Brand"
        ORDER BY b."Denumire_Brand";
      `;

      const result = await db.query(query);
      brands = result.rows;

      await cache.set(cacheKey, brands, 3600);
    }

    return NextResponse.json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch brands",
      },
      { status: 500 }
    );
  }
}
