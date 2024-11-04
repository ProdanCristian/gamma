import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const query = `
      SELECT *
      FROM public."nc_pka4___Categorii"
      ORDER BY id ASC;
    `;

    const res = await db.query(query);

    return NextResponse.json({ success: true, data: res.rows });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}
