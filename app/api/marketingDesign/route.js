import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

const CACHE_KEY = "marketing:design:data";
const CACHE_TTL = 86400; // 1 day

export async function GET() {
  const NEXT_PUBLIC_MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

  try {
    // Try to get from cache first
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData });
    }

    const query = `
      SELECT *
      FROM public."nc_ssxn___Marketing-Design"
      ORDER BY id ASC;
    `;

    const result = await db.query(query);

    const processedData = result.rows.map((row) => {
      const extractFullUrls = (items) => {
        if (!items) return [];
        try {
          const parsed = JSON.parse(items);
          return parsed.map((item) =>
            item.path
              ? `${NEXT_PUBLIC_MEDIA_URL}${
                  item.path.startsWith("/") ? "" : "/"
                }${item.path}`
              : ""
          );
        } catch {
          return [];
        }
      };

      return {
        id: row.id,
        Logo: extractFullUrls(row.Logo),
        Bannere_Slider_RO_: extractFullUrls(row.Bannere_Slider_RO_),
        Bannere_Slider_RU_: extractFullUrls(row.Bannere_Slider_RU_),
        Logo_Black: extractFullUrls(row.Logo_Black),
        Banner1_RO_: extractFullUrls(row.Banner1_RO_),
        Banner2_RO_: extractFullUrls(row.Banner2_RO_),
        Banner3_RO_: extractFullUrls(row.Banner3_RO_),
        Banner1_RU_: extractFullUrls(row.Banner1_RU_),
        Banner2_RU_: extractFullUrls(row.Banner2_RU_),
        Banner3_RU_: extractFullUrls(row.Banner3_RU_),
      };
    });

    // Cache the processed data
    await cache.set(CACHE_KEY, processedData, CACHE_TTL);

    return NextResponse.json({ success: true, data: processedData });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch marketing design data",
      },
      { status: 500 }
    );
  }
}
