import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.getAll("ids");

    if (!ids.length) {
      return NextResponse.json(
        { success: false, error: "Product IDs are required" },
        { status: 400 }
      );
    }

    const { rows } = await db.query(
      `SELECT id, "Stock" FROM public."nc_pka4__Produse" WHERE id = ANY($1)`,
      [ids]
    );

    const stockData = rows.reduce((acc, row) => {
      acc[row.id] = row.Stock;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: stockData,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock" },
      { status: 500 }
    );
  }
}
