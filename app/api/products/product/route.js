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
      SELECT p.*, b."Denumire_Brand" as brand_name
      FROM public."nc_pka4__Produse" p
      LEFT JOIN public."nc_pka4___Branduri" b 
      ON p."nc_pka4___Branduri_id" = b.id
      WHERE p.id = $1;
    `;

    const res = await db.query(query, [id]);

    if (res.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}
