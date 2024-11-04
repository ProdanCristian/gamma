import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const query = `
      SELECT *
      FROM public."nc_pka4__Produse"
      WHERE "nc_pka4___SubSubCategorii_id" = $1
      ORDER BY RANDOM()
      LIMIT 8;
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No similar products found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch similar products",
      },
      { status: 500 }
    );
  }
}
