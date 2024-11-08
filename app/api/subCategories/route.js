import { NextResponse } from "next/server";
import db from "@/lib/db";

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
    const subcategoriesQuery = `
      SELECT id, "Nume_SubCategorie_RO", "Nume__SubCategorie_RU", "nc_pka4___Categorii_id", "Images"
      FROM public."nc_pka4___SubCategorii"
      WHERE "nc_pka4___Categorii_id" = $1
      ORDER BY id ASC;
    `;

    const subcategoriesRes = await db.query(subcategoriesQuery, [categoryId]);
    const subcategories = subcategoriesRes.rows;

    const subcategoryIds = subcategories.map((sub) => sub.id);

    const subSubcategoriesQuery = `
      SELECT id, "Nume_SubSubCategorie_RO", "Nume_SubSubCategorie_RU", "nc_pka4___SubCategorii_id"
      FROM public."nc_pka4___SubSubCategorii"
      WHERE "nc_pka4___SubCategorii_id" = ANY($1::int[])
      ORDER BY id ASC;
    `;

    const subSubcategoriesRes = await db.query(subSubcategoriesQuery, [
      subcategoryIds,
    ]);
    const subSubcategories = subSubcategoriesRes.rows;

    const formattedData = subcategories.map((subcategory) => {
      const filteredSubSubcategories = subSubcategories.filter(
        (subSub) => subSub.nc_pka4___SubCategorii_id === subcategory.id
      );

      let images = [];
      if (subcategory.Images) {
        try {
          const parsedImages = JSON.parse(subcategory.Images);
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
        id: subcategory.id,
        subcategory_name_ro: subcategory.Nume_SubCategorie_RO,
        subcategory_name_ru: subcategory.Nume__SubCategorie_RU,
        images,
        subSubcategories: filteredSubSubcategories.map((subSub) => ({
          id: subSub.id,
          subsub_name_ro: subSub.Nume_SubSubCategorie_RO,
          subsub_name_ru: subSub.Nume_SubSubCategorie_RU,
        })),
      };
    });

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
