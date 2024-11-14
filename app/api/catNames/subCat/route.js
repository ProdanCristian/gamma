import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

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

    // Try to get from cache first
    const CACHE_KEY = `subcategory:${id}:names`;
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData });
    }

    const sqlQuery = `
      SELECT "Nume_SubCategorie_RO", "Nume__SubCategorie_RU"
      FROM public."nc_pka4___SubCategorii"
      WHERE id = $1
    `;

    const result = await db.query(sqlQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Subcategory not found" },
        { status: 404 }
      );
    }

    const transformedData = {
      Nume_SubCategorie_RO: result.rows[0].Nume_SubCategorie_RO,
      Nume_SubCategorie_RU: result.rows[0].Nume__SubCategorie_RU,
    };

    // Cache the result for 1 hour
    await cache.set(CACHE_KEY, transformedData, 3600);

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
