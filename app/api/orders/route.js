import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DELIVERY_RULES } from "@/lib/store/useCart";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const requestData = await request.json();

    const {
      userId,
      numePrenume,
      numarTelefon,
      products: rawProducts,
      deliveryZone,
      isFreeDelivery,
      address,
      couponCode,
      couponDiscount,
      total: cartTotal,
      paymentMethod,
    } = requestData;

    const products = Array.isArray(rawProducts)
      ? rawProducts
      : rawProducts
      ? [rawProducts]
      : [];

    if (!products.length) {
      throw new Error("No products provided in the request");
    }

    await db.query("BEGIN");

    try {
      const chisinauTime = new Date().toLocaleString("en-US", {
        timeZone: "Europe/Chisinau",
      });
      const chisinauDate = new Date(chisinauTime);
      const deliveryPrice = isFreeDelivery
        ? 0
        : DELIVERY_RULES[deliveryZone].cost;

      const orderIds = [];
      let totalOrderAmount = 0;

      for (const product of products) {
        const productResult = await db.query(
          `SELECT "Pret_Standard", "Pret_Redus" FROM "nc_pka4__Produse" WHERE "id" = $1`,
          [product.id]
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Product with ID ${product.id} not found`);
        }

        const dbProduct = productResult.rows[0];
        const basePrice =
          dbProduct.Pret_Redus &&
          parseFloat(dbProduct.Pret_Redus) < parseFloat(dbProduct.Pret_Standard)
            ? parseFloat(dbProduct.Pret_Redus)
            : parseFloat(dbProduct.Pret_Standard);

        const finalProductPrice = basePrice * (1 - couponDiscount / 100);

        const couponInfo = couponCode
          ? `${couponCode} (-${couponDiscount}%)`
          : null;

        const subtotal = finalProductPrice * product.quantity;
        const orderTotal = subtotal + (isFreeDelivery ? 0 : deliveryPrice);
        totalOrderAmount += orderTotal;

        const orderResult = await db.query(
          `INSERT INTO "nc_pka4___Comenzi" 
          ("nc_pka4___Utilizatori_id", "Nume_Prenume", "Numar_telefon", 
           "nc_pka4__Produse_id", "Status", "Cantitate", "Pret_Livrare", 
           "Total", "created_at", "Adresa_Livrare", "Cupon_Aplicat", "Pret_Produs", "Metoda_De_Plata") 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
          RETURNING id`,
          [
            userId || null,
            numePrenume,
            numarTelefon,
            product.id,
            "De Confirmat",
            product.quantity,
            isFreeDelivery ? "Gratis" : deliveryPrice.toString(),
            cartTotal.toFixed(2),
            chisinauDate,
            address,
            couponInfo,
            finalProductPrice.toFixed(2),
            paymentMethod,
          ]
        );

        orderIds.push(orderResult.rows[0].id);
      }

      await db.query("COMMIT");

      return NextResponse.json({
        success: true,
        orderIds: orderIds,
      });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating orders:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create orders",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
