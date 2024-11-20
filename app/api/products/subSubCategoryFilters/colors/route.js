import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subSubCategoryId = searchParams.get("subSubCategoryId");

    if (!subSubCategoryId) {
      return NextResponse.json(
        { error: "SubSubCategory ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `subsubcategory_colors:${subSubCategoryId}`;
    let colors = await cache.get(cacheKey);

    if (!colors) {
      const query = `
        WITH subsubcategory_products AS (
          SELECT DISTINCT p.id, p."nc_pka4___Culori_id"
          FROM "nc_pka4__Produse" p
          JOIN "nc_pka4___SubSubCategorii" ssc ON p."nc_pka4___SubSubCategorii_id" = ssc.id
          WHERE ssc.id = $1 AND p."nc_pka4___Culori_id" IS NOT NULL
        )
        SELECT 
          c.id,
          c."Culoare_RO_",
          c."Culoare_RU_",
          c."Cod_Culoare"
        FROM public."nc_pka4___Culori" c
        INNER JOIN subsubcategory_products sp ON c.id = sp."nc_pka4___Culori_id"
        WHERE c."Cod_Culoare" IS NOT NULL
        GROUP BY c.id, c."Culoare_RO_", c."Culoare_RU_", c."Cod_Culoare"
        ORDER BY c.id;
      `;

      const result = await db.query(query, [subSubCategoryId]);
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
