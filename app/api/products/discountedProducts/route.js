import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "12");

    const cacheKey = `discounted_products:${limit}`;

    let products = await cache.get(cacheKey);

    if (!products) {
      const { rows } = await db.query(
        `SELECT * FROM public."nc_pka4__Produse"
          WHERE "Pret_Standard" > "Pret_Redus" 
          AND "Disponibil" = true
          LIMIT $1`,
        [limit]
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

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
