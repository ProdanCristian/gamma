import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const cacheKey = `bestselling_products:${limit}`;

    let cachedData = await cache.get(cacheKey);
    let products;

    if (cachedData) {
      products = cachedData;
    } else {
      const { rows } = await db.query(
        `SELECT 
          id, "Nume_Produs_RO", "Nume_Produs_RU", "Pret_Standard", 
          "Pret_Redus", "Imagine_Principala", "imagini_Secundare"
         FROM public."nc_pka4__Produse"
         WHERE "Bestselling" = true AND "Disponibil" = true
         ORDER BY id DESC
         LIMIT $1`,
        [limit]
      );

      products = rows.map((product) => ({
        ...product,
        Pret_Standard: parseFloat(product.Pret_Standard),
        Pret_Redus: product.Pret_Redus ? parseFloat(product.Pret_Redus) : null,
        imagini_Secundare: product.imagini_Secundare
          ? JSON.parse(product.imagini_Secundare)
          : [],
      }));

      await cache.set(cacheKey, products, 86400);
    }

    if (products?.length > 0) {
      const productIds = products.map((p) => p.id);
      const { rows: stockData } = await db.query(
        `SELECT id, "Stock" FROM public."nc_pka4__Produse" WHERE id = ANY($1)`,
        [productIds]
      );

      products = products.map((product) => ({
        ...product,
        Stock: stockData.find((s) => s.id === product.id)?.Stock || 0,
      }));
    }

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
