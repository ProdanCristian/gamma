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

    const cacheKey = `similar_products:${id}`;
    let products = await cache.get(cacheKey);

    if (!products) {
      const { rows } = await db.query(
        `SELECT *
        FROM public."nc_pka4__Produse"
        WHERE "nc_pka4___SubSubCategorii_id" = $1
        AND "Disponibil" = true
        ORDER BY RANDOM()
        LIMIT 8`,
        [id]
      );

      products = rows;
      await cache.set(cacheKey, products, 3600);
    }

    if (products?.length) {
      const productIds = products.map((p) => p.id);
      const { rows: stockData } = await db.query(
        `SELECT id, "Stock" FROM public."nc_pka4__Produse"
         WHERE id = ANY($1)`,
        [productIds]
      );

      products = products.map((product) => {
        const currentStock = stockData.find((s) => s.id === product.id);
        return {
          ...product,
          Stock: currentStock?.Stock,
        };
      });
    }

    if (products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No similar products found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch similar products",
      },
      { status: 500 }
    );
  }
}
