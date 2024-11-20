import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

const CACHE_KEY = "categories:all";
const CACHE_TTL = 86400;

export async function GET() {
  try {
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData });
    }

    const query = `
      SELECT *
      FROM public."nc_pka4___Categorii"
      ORDER BY id ASC;
    `;

    const res = await db.query(query);

    await cache.set(CACHE_KEY, res.rows, CACHE_TTL);

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
