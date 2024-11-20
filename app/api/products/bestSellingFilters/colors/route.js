import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET() {
  try {
    const cacheKey = "bestselling_colors";
    let colors = await cache.get(cacheKey);

    if (!colors) {
      const query = `
        WITH bestseller_products AS (
          SELECT DISTINCT p.id, p."nc_pka4___Culori_id"
          FROM "nc_pka4__Produse" p
          WHERE p."Bestselling" = true AND p."nc_pka4___Culori_id" IS NOT NULL
        )
        SELECT 
          c.id,
          c."Culoare_RO_",
          c."Culoare_RU_",
          c."Cod_Culoare"
        FROM public."nc_pka4___Culori" c
        INNER JOIN bestseller_products bp ON c.id = bp."nc_pka4___Culori_id"
        WHERE c."Cod_Culoare" IS NOT NULL
        GROUP BY c.id, c."Culoare_RO_", c."Culoare_RU_", c."Cod_Culoare"
        ORDER BY c.id;
      `;

      const result = await db.query(query);
      colors = result.rows;

      await cache.set(cacheKey, colors, 3600);
    }

    return NextResponse.json({
      success: true,
      colors,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch colors",
      },
      { status: 500 }
    );
  }
}
