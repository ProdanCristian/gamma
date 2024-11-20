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

    const query = `
      WITH user_id AS (
        SELECT id FROM "nc_pka4___Utilizatori"
        WHERE "Email" = $1
        LIMIT 1
      )
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
      LEFT JOIN "nc_pka4__Produse" p ON c."nc_pka4__Produse_id" = p.id
      WHERE c."nc_pka4___Utilizatori_id" = (SELECT id FROM user_id)
      ORDER BY c.created_at DESC
    `;

    const orders = await db.query(query, [session.user.email]);

    const NEXT_PUBLIC_MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;
    const formattedOrders = orders.rows.map((order) => {
      if (order.Imagine_Principala) {
        try {
          const imageData = JSON.parse(order.Imagine_Principala);
          if (Array.isArray(imageData) && imageData[0]?.path) {
            order.Imagine_Principala = `${NEXT_PUBLIC_MEDIA_URL}/${imageData[0].path}`;
          }
        } catch {
          order.Imagine_Principala = null;
        }
      }
      return order;
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
