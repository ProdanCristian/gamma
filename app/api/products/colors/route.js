import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const query = `
      WITH used_colors AS (
        SELECT DISTINCT "nc_pka4___Culori_id"
        FROM public."nc_pka4__Produse"
        WHERE "nc_pka4___Culori_id" IS NOT NULL
      )
      SELECT 
        c.id,
        c."Culoare_RO_",
        c."Culoare_RU_",
        c."Cod_Culoare"
      FROM public."nc_pka4___Culori" c
      INNER JOIN used_colors uc ON c.id = uc."nc_pka4___Culori_id"
      WHERE c."Cod_Culoare" IS NOT NULL
      ORDER BY c.id;
    `;

    const result = await db.query(query);

    return NextResponse.json({
      success: true,
      colors: result.rows,
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
