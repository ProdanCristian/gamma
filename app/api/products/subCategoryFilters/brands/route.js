import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subCategoryId = searchParams.get("subCategoryId");

    if (!subCategoryId) {
      return NextResponse.json(
        { error: "SubCategory ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `subcategory_brands:${subCategoryId}`;
    let brands = await cache.get(cacheKey);

    if (!brands) {
      const query = `
        WITH subcategory_products AS (
          SELECT DISTINCT p.id, p."nc_pka4___Branduri_id"
          FROM "nc_pka4__Produse" p
          JOIN "nc_pka4___SubSubCategorii" ssc ON p."nc_pka4___SubSubCategorii_id" = ssc.id
          JOIN "nc_pka4___SubCategorii" sc ON ssc."nc_pka4___SubCategorii_id" = sc.id
          WHERE sc.id = $1 AND p."nc_pka4___Branduri_id" IS NOT NULL
        )
        SELECT 
          b.id,
          b."Denumire_Brand"
        FROM public."nc_pka4___Branduri" b
        INNER JOIN subcategory_products sp ON b.id = sp."nc_pka4___Branduri_id"
        WHERE b."Denumire_Brand" IS NOT NULL
        GROUP BY b.id, b."Denumire_Brand"
        ORDER BY b."Denumire_Brand";
      `;

      const result = await db.query(query, [subCategoryId]);
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
