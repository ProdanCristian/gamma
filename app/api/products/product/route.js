import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const cacheKey = `product:${id}`;
    let product = await cache.get(cacheKey);

    if (!product) {
      const { rows } = await db.query(
        `SELECT p.*, b."Denumire_Brand" as brand_name
        FROM public."nc_pka4__Produse" p
        LEFT JOIN public."nc_pka4___Branduri" b 
        ON p."nc_pka4___Branduri_id" = b.id
        WHERE p.id = $1 AND p."Disponibil" = true`,
        [id]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Product not found",
          },
          { status: 404 }
        );
      }

      product = rows[0];
      await cache.set(cacheKey, product, 3600);
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}
