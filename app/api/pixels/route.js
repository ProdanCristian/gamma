import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(req) {
  try {
    const CACHE_KEY = "pixels_data";
    const cachedData = await cache.get(CACHE_KEY);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const pixels = await db.query(
      'SELECT "Pixels" FROM "nc_ssxn__Settings" LIMIT 1'
    );

    await cache.set(CACHE_KEY, pixels.rows[0], 86400);

    return NextResponse.json(pixels.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pixels data" },
      { status: 500 }
    );
  }
}
