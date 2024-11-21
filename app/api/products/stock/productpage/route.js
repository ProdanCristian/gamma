import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { rows } = await db.query(
      `SELECT "Stock" FROM public."nc_pka4__Produse" WHERE id = $1`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { Stock: rows[0].Stock },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock" },
      { status: 500 }
    );
  }
}
