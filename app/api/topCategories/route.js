import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL;

  try {
    const query = `
      SELECT 
        sub.*,
        cat.id as cat_id,
        cat."Nume_Categorie_RO" as cat_name_ro,
        cat."Nume_Categorie_RU" as cat_name_ru
      FROM public."nc_pka4___SubCategorii" sub
      LEFT JOIN public."nc_pka4___Categorii" cat
      ON sub."nc_pka4___Categorii_id" = cat.id
      WHERE sub."Top_Categorii" = TRUE
    `;

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
          ? `${NOCODB_BASE_URL}${
              imagePath.startsWith("/") ? "" : "/"
            }${imagePath}`
          : "",
        mainCategory: row.cat_id
          ? {
              id: row.cat_id,
              nameRo: row.cat_name_ro,
              nameRu: row.cat_name_ru,
            }
          : null,
      };
    });

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
