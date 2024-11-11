import { NextResponse } from "next/server";
import db from "@/lib/db";

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

    const query = `
      WITH subsubcategory_products AS (
        SELECT DISTINCT p.id, p."nc_pka4__Atribute_id", p."Valoare_Atribut"
        FROM "nc_pka4__Produse" p
        JOIN "nc_pka4___SubSubCategorii" ssc ON p."nc_pka4___SubSubCategorii_id" = ssc.id
        WHERE ssc.id = $1 AND p."nc_pka4__Atribute_id" IS NOT NULL
      )
      SELECT 
        a.id,
        a."Atribut_RO_",
        a."Atribut_RU_",
        ARRAY_AGG(DISTINCT sp."Valoare_Atribut") FILTER (
          WHERE sp."Valoare_Atribut" IS NOT NULL 
          AND sp."Valoare_Atribut" != ''
        ) as values
      FROM public."nc_pka4__Atribute" a
      INNER JOIN subsubcategory_products sp ON a.id = sp."nc_pka4__Atribute_id"
      GROUP BY a.id, a."Atribut_RO_", a."Atribut_RU_"
      HAVING COUNT(DISTINCT sp."Valoare_Atribut") > 0
      ORDER BY a.id;
    `;

    const result = await db.query(query, [subSubCategoryId]);

    const attributes = result.rows.filter(
      (attr) =>
        attr.values && Array.isArray(attr.values) && attr.values.length > 0
    );

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
