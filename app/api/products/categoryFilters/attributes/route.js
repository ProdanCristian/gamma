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
        SELECT DISTINCT p.id, p."nc_pka4__Atribute_id", p."Valoare_Atribut"
        FROM "nc_pka4__Produse" p
        JOIN "nc_pka4___SubSubCategorii" ssc ON p."nc_pka4___SubSubCategorii_id" = ssc.id
        JOIN "nc_pka4___SubCategorii" sc ON ssc."nc_pka4___SubCategorii_id" = sc.id
        JOIN "nc_pka4___Categorii" c ON sc."nc_pka4___Categorii_id" = c.id
        WHERE c.id = $1 AND p."nc_pka4__Atribute_id" IS NOT NULL
      )
      SELECT 
        a.id,
        a."Atribut_RO_",
        a."Atribut_RU_",
        ARRAY_AGG(DISTINCT cp."Valoare_Atribut") FILTER (
          WHERE cp."Valoare_Atribut" IS NOT NULL 
          AND cp."Valoare_Atribut" != ''
        ) as values
      FROM public."nc_pka4__Atribute" a
      INNER JOIN category_products cp ON a.id = cp."nc_pka4__Atribute_id"
      GROUP BY a.id, a."Atribut_RO_", a."Atribut_RU_"
      HAVING COUNT(DISTINCT cp."Valoare_Atribut") > 0
      ORDER BY a.id;
    `;

    const result = await db.query(query, [categoryId]);

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
