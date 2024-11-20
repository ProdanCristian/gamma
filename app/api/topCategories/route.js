import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

const CACHE_KEY = "categories:top";
const CACHE_TTL = 86400;

export async function GET() {
  const NEXT_PUBLIC_MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

  try {
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({ success: true, categories: cachedData });
    }

    const query = `
      SELECT 
        sub.id,
        sub."Nume_SubCategorie_RO",
        sub."Nume__SubCategorie_RU",
        sub."Images",
        cat.id as cat_id,
        cat."Nume_Categorie_RO" as cat_name_ro,
        cat."Nume_Categorie_RU" as cat_name_ru
      FROM public."nc_pka4___SubCategorii" sub
      INNER JOIN public."nc_pka4___Categorii" cat
      ON sub."nc_pka4___Categorii_id" = cat.id
      WHERE sub."Top_Categorii" = TRUE`;

    const result = await db.query(query);

    const topCategories = result.rows.map((row) => {
      let imagePath = "";
      try {
        const images = JSON.parse(row.Images);
        imagePath = images[0]?.path || "";
      } catch {
        imagePath = "";
      }

      return {
        id: row.id,
        nameRo: row.Nume_SubCategorie_RO,
        nameRu: row.Nume__SubCategorie_RU,
        imagePath: imagePath
          ? `${NEXT_PUBLIC_MEDIA_URL}${
              imagePath.startsWith("/") ? "" : "/"
            }${imagePath}`
          : "",
        mainCategory: {
          id: row.cat_id,
          nameRo: row.cat_name_ro,
          nameRu: row.cat_name_ru,
        },
      };
    });

    await cache.set(CACHE_KEY, topCategories, CACHE_TTL);

    return NextResponse.json({
      success: true,
      categories: topCategories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch topCategories",
      },
      { status: 500 }
    );
  }
}
