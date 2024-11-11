import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const query = `
      WITH category_products AS (
        SELECT DISTINCT p.id, p."nc_pka4___Branduri_id"
        FROM "nc_pka4__Produse" p
        JOIN "nc_pka4___SubSubCategorii" ssc ON p."nc_pka4___SubSubCategorii_id" = ssc.id
        JOIN "nc_pka4___SubCategorii" sc ON ssc."nc_pka4___SubCategorii_id" = sc.id
        JOIN "nc_pka4___Categorii" c ON sc."nc_pka4___Categorii_id" = c.id
        WHERE c.id = $1 AND p."nc_pka4___Branduri_id" IS NOT NULL
      )
      SELECT 
        b.id,
        b."Denumire_Brand"
      FROM public."nc_pka4___Branduri" b
      INNER JOIN category_products cp ON b.id = cp."nc_pka4___Branduri_id"
      WHERE b."Denumire_Brand" IS NOT NULL
      GROUP BY b.id, b."Denumire_Brand"
      ORDER BY b."Denumire_Brand";
    `;

    const result = await db.query(query, [categoryId]);

    return NextResponse.json({
      success: true,
      brands: result.rows,
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
