import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const sqlQuery = `
      SELECT "Nume_SubSubCategorie_RO", "Nume_SubSubCategorie_RU"
      FROM public."nc_pka4___SubSubCategorii"
      WHERE id = $1
    `;

    const result = await db.query(sqlQuery, [id]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "SubSubcategory not found" },
        { status: 404 }
      );
    }

    const transformedData = {
      Nume_SubSubCategorie_RO: result.rows[0].Nume_SubSubCategorie_RO,
      Nume_SubSubCategorie_RU: result.rows[0].Nume_SubSubCategorie_RU,
    };

    return NextResponse.json({ success: true, data: transformedData });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: { errorCode: error.code, errorMessage: error.message },
      },
      { status: 500 }
    );
  }
}
