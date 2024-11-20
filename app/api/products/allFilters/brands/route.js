import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET() {
  try {
    const cacheKey = "all_brands";
    let brands = await cache.get(cacheKey);

    if (!brands) {
      const query = `
        WITH used_brands AS (
          SELECT DISTINCT "nc_pka4___Branduri_id"
          FROM public."nc_pka4__Produse"
          WHERE "nc_pka4___Branduri_id" IS NOT NULL
        )
        SELECT 
          b.id,
          b."Denumire_Brand"
        FROM public."nc_pka4___Branduri" b
        INNER JOIN used_brands ub ON b.id = ub."nc_pka4___Branduri_id"
        WHERE b."Denumire_Brand" IS NOT NULL
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
