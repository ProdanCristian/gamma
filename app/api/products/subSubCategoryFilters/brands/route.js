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

    const cacheKey = `subsubcategory_brands:${subSubCategoryId}`;
    let brands = await cache.get(cacheKey);

    if (!brands) {
      const query = `
        WITH subsubcategory_products AS (
          SELECT DISTINCT p.id, p."nc_pka4___Branduri_id"
          FROM "nc_pka4__Produse" p
          JOIN "nc_pka4___SubSubCategorii" ssc ON p."nc_pka4___SubSubCategorii_id" = ssc.id
          WHERE ssc.id = $1 AND p."nc_pka4___Branduri_id" IS NOT NULL
        )
        SELECT 
          b.id,
          b."Denumire_Brand"
        FROM public."nc_pka4___Branduri" b
        INNER JOIN subsubcategory_products sp ON b.id = sp."nc_pka4___Branduri_id"
        WHERE b."Denumire_Brand" IS NOT NULL
        GROUP BY b.id, b."Denumire_Brand"
        ORDER BY b."Denumire_Brand";
      `;

      const result = await db.query(query, [subSubCategoryId]);
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
