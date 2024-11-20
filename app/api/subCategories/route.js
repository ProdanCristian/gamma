import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");
  const NEXT_PUBLIC_MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

  if (!categoryId) {
    return NextResponse.json(
      { success: false, error: "Category ID is required" },
      { status: 400 }
    );
  }

  try {
    const CACHE_KEY = `subcategories:category:${categoryId}`;
    const cachedData = await cache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData });
    }

    const query = `
      WITH subcategories AS (
        SELECT 
          id,
          "Nume_SubCategorie_RO",
          "Nume__SubCategorie_RU",
          "Images"
        FROM public."nc_pka4___SubCategorii"
        WHERE "nc_pka4___Categorii_id" = $1
      ),
      subsubcategories AS (
        SELECT 
          id,
          "Nume_SubSubCategorie_RO",
          "Nume_SubSubCategorie_RU",
          "nc_pka4___SubCategorii_id"
        FROM public."nc_pka4___SubSubCategorii"
        WHERE "nc_pka4___SubCategorii_id" IN (SELECT id FROM subcategories)
      )
      SELECT 
        json_build_object(
          'id', s.id,
          'subcategory_name_ro', s."Nume_SubCategorie_RO",
          'subcategory_name_ru', s."Nume__SubCategorie_RU",
          'images', s."Images",
          'subSubcategories', COALESCE(
            json_agg(
              json_build_object(
                'id', ss.id,
                'subsub_name_ro', ss."Nume_SubSubCategorie_RO",
                'subsub_name_ru', ss."Nume_SubSubCategorie_RU"
              )
            ) FILTER (WHERE ss.id IS NOT NULL),
            '[]'::json
          )
        ) as data
      FROM subcategories s
      LEFT JOIN subsubcategories ss ON ss."nc_pka4___SubCategorii_id" = s.id
      GROUP BY s.id, s."Nume_SubCategorie_RO", s."Nume__SubCategorie_RU", s."Images"
      ORDER BY s.id ASC;
    `;

    const result = await db.query(query, [categoryId]);

    const formattedData = result.rows.map((row) => {
      const { data } = row;
      let images = [];

      if (data.images) {
        try {
          const parsedImages = JSON.parse(data.images);
          images = parsedImages.map(
            (img) =>
              `${NEXT_PUBLIC_MEDIA_URL}${img.path.startsWith("/") ? "" : "/"}${
                img.path
              }`
          );
        } catch {
          images = [];
        }
      }

      return {
        ...data,
        images,
      };
    });

    await cache.set(CACHE_KEY, formattedData, 86400);

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to fetch subcategories and sub-subcategories",
      },
      { status: 500 }
    );
  }
}
