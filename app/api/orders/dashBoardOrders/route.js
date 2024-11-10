import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userQuery = `
      SELECT id FROM "nc_pka4___Utilizatori"
      WHERE "Email" = $1
      LIMIT 1
    `;

    const userResult = await db.query(userQuery, [session.user.email]);

    if (!userResult.rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    const ordersQuery = `
      SELECT 
        c.id,
        c."Status",
        c."Nume_Prenume",
        c."Numar_telefon",
        c."Pret_Livrare",
        c."Cantitate",
        c."Total",
        c."Pret_Produs",
        c."Cupon_Aplicat",
        c."Adresa_Livrare",
        c.created_at,
        c."nc_pka4__Produse_id" as product_id,
        p."Nume_Produs_RO",
        p."Nume_Produs_RU",
        p."Imagine_Principala",
        p."Pret_Standard"
      FROM "nc_pka4___Comenzi" c
      LEFT JOIN "nc_pka4__Produse" p 
      ON c."nc_pka4__Produse_id" = p.id
      WHERE c."nc_pka4___Utilizatori_id" = $1
      ORDER BY c.created_at DESC
    `;

    const orders = await db.query(ordersQuery, [userId]);

    const formattedOrders = orders.rows.map((order) => {
      if (order.Imagine_Principala) {
        try {
          const imageData = JSON.parse(order.Imagine_Principala);
          if (Array.isArray(imageData) && imageData[0]?.path) {
            order.Imagine_Principala = `${process.env.NEXT_PUBLIC_MEDIA_URL}/${imageData[0].path}`;
          }
        } catch (e) {
          console.error("Error parsing image data:", e);
        }
      }
      return order;
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
