import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const query = `
      WITH used_attributes AS (
        SELECT DISTINCT "nc_pka4__Atribute_id"
        FROM public."nc_pka4__Produse"
        WHERE "nc_pka4__Atribute_id" IS NOT NULL
      )
      SELECT 
        a.id,
        a."Atribut_RO_",
        a."Atribut_RU_",
        ARRAY_AGG(DISTINCT p."Valoare_Atribut") FILTER (
          WHERE p."Valoare_Atribut" IS NOT NULL 
          AND p."Valoare_Atribut" != ''
        ) as values
      FROM public."nc_pka4__Atribute" a
      INNER JOIN used_attributes ua ON a.id = ua."nc_pka4__Atribute_id"
      INNER JOIN public."nc_pka4__Produse" p ON p."nc_pka4__Atribute_id" = a.id
      WHERE p."Valoare_Atribut" IS NOT NULL 
      AND p."Valoare_Atribut" != ''
      GROUP BY a.id, a."Atribut_RO_", a."Atribut_RU_"
      HAVING COUNT(DISTINCT p."Valoare_Atribut") > 0
      ORDER BY a.id;
    `;

    const result = await db.query(query);

    // Additional safety check to filter out any attributes with empty values array
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
