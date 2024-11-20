import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cache } from "@/lib/redis/cache";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const attributeValue = searchParams.get("attribute");
    const colorId = searchParams.get("color");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Variant ID is required",
        },
        { status: 400 }
      );
    }

    const cacheKey = `variants:${id}:${attributeValue || ""}:${colorId || ""}`;
    let products = await cache.get(cacheKey);

    if (!products) {
      let query = `
        SELECT 
          p.*,
          a."Atribut_RO_" as "Atribut_RO",
          a."Atribut_RU_" as "Atribut_RU",
          c."Culoare_RO_" as "Culoare_RO",
          c."Culoare_RU_" as "Culoare_RU",
          c."Cod_Culoare",
          v."Imagini" as "ShowVariantImages"
        FROM public."nc_pka4__Produse" p
        LEFT JOIN public."nc_pka4__Atribute" a ON p."nc_pka4__Atribute_id" = a.id
        LEFT JOIN public."nc_pka4___Culori" c ON p."nc_pka4___Culori_id" = c.id
        LEFT JOIN public."nc_pka4___Variante" v ON p."nc_pka4___Variante_id" = v.id
        WHERE p."nc_pka4___Variante_id" = $1
      `;

      const queryParams = [id];
      let paramCount = 1;

      if (attributeValue) {
        paramCount++;
        query += ` AND p."Valoare_Atribut_1" = $${paramCount}`;
        queryParams.push(attributeValue);
      }

      if (colorId) {
        paramCount++;
        query += ` AND p."nc_pka4___Culori_id" = $${paramCount}`;
        queryParams.push(colorId);
      }

      const { rows } = await db.query(query, queryParams);

      if (rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No products found for this variant",
          },
          { status: 404 }
        );
      }

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

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch products by variant",
      },
      { status: 500 }
    );
  }
}
