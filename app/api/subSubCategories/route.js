import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subcategoryId = searchParams.get("subcategoryId");

    if (!subcategoryId) {
      return NextResponse.json(
        { success: false, error: "Subcategory ID is required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        id,
        "Nume_SubSubCategorie_RO" as subsub_name_ro,
        "Nume_SubSubCategorie_RU" as subsub_name_ru,
        "nc_pka4___SubCategorii_id"
      FROM public."nc_pka4___SubSubCategorii"
      WHERE "nc_pka4___SubCategorii_id" = $1
      ORDER BY id ASC;
    `;

    const result = await db.query(query, [subcategoryId]);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
