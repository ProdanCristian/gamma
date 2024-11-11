import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const query = `
      WITH bestseller_products AS (
        SELECT DISTINCT p.id, p."nc_pka4___Branduri_id"
        FROM "nc_pka4__Produse" p
        WHERE p."Bestselling" = true AND p."nc_pka4___Branduri_id" IS NOT NULL
      )
      SELECT 
        b.id,
        b."Denumire_Brand"
      FROM public."nc_pka4___Branduri" b
      INNER JOIN bestseller_products bp ON b.id = bp."nc_pka4___Branduri_id"
      WHERE b."Denumire_Brand" IS NOT NULL
      GROUP BY b.id, b."Denumire_Brand"
      ORDER BY b."Denumire_Brand";
    `;

    const result = await db.query(query);

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
