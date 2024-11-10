import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "12");

    const { rows } = await db.query(
      `SELECT * FROM public."nc_pka4__Produse"
        LIMIT $1`,
      [limit]
    );

    return NextResponse.json({
      success: true,
      products: rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
