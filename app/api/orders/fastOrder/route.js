import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DELIVERY_RULES } from "@/lib/store/useCart";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const {
      userId,
      numePrenume,
      numarTelefon,
      productId,
      quantity,
      deliveryZone,
      isFreeDelivery,
    } = await request.json();

    await db.query("BEGIN");

    try {
      const productResult = await db.query(
        `SELECT "Pret_Standard", "Pret_Redus" FROM "nc_pka4__Produse" WHERE "id" = $1`,
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error("Product not found");
      }

      const product = productResult.rows[0];
      const productPrice =
        product.Pret_Redus &&
        parseFloat(product.Pret_Redus) < parseFloat(product.Pret_Standard)
          ? product.Pret_Redus
          : product.Pret_Standard;

      const subtotal = parseFloat(productPrice) * quantity;
      const deliveryPrice = isFreeDelivery
        ? 0
        : DELIVERY_RULES[deliveryZone].cost;
      const total = subtotal + deliveryPrice;

      const orderResult = await db.query(
        `INSERT INTO "nc_pka4___Comenzi" (
          "nc_pka4___Utilizatori_id",
          "Nume_Prenume",
          "Numar_telefon",
          "nc_pka4__Produse_id",
          "Status",
          "Cantitate",
          "Pret_Livrare",
          "Total"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "id"`,
        [
          userId || null,
          numePrenume,
          numarTelefon,
          productId,
          "De Confirmat",
          quantity,
          isFreeDelivery
            ? "Gratis"
            : DELIVERY_RULES[deliveryZone].cost.toString(),
          total.toFixed(2),
        ]
      );

      await db.query("COMMIT");

      return NextResponse.json({
        success: true,
        orderId: orderResult.rows[0].id,
      });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create order",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
