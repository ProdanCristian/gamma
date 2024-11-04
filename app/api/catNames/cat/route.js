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
      SELECT "Nume_Categorie_RO", "Nume_Categorie_RU"
      FROM public."nc_pka4___Categorii"
      WHERE id = $1
    `;

    const result = await db.query(sqlQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
        details: { errorCode: error.code, errorMessage: error.message },
      },
      { status: 500 }
    );
  }
}
