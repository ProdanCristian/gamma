import { NextResponse } from "next/server";
import webpush from "web-push";
import db from "@/lib/db";
import { getLocale } from "next-intl/server";

type OrderStatus =
  | "Solicitare Primita"
  | "Comanda Confirmata"
  | "Transmis la Curier"
  | "Comanda Finalizata"
  | "Retur"
  | "Anulata";

type ImageData = {
  path: string;
  title: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  id: string;
  thumbnails: {
    tiny: { signedPath: string };
    small: { signedPath: string };
    card_cover: { signedPath: string };
  };
  signedPath: string;
};

type OrderData = {
  Id: number;
  "Nume Prenume": string;
  CreatedAt: string;
  UpdatedAt: string;
  "Numar telefon": string;
  Cantitate: number;
  "Pret Livrare": string;
  Total: number;
  Status: OrderStatus;
  "Cupon Aplicat": string | null;
  "Adresa Livrare": string;
  Conversie: any;
  "Pret Produs": number;
  "Metoda De Plata": string;
  Email: string;
  "Id Comanda": number;
  Utilizator: {
    Id: number;
    Nume: string;
  };
  Produs: {
    "COD PRODUS": number;
    Id: number;
    Nume_Produs_RO: string;
    Imagine_Principala: ImageData[];
  };
  "Imagine_Principala (from Produse)": ImageData[];
  "COD PRODUS": number;
};

type WebhookPayload = {
  type: string;
  id: string;
  data: {
    table_id: string;
    table_name: string;
    previous_rows: OrderData[];
    rows: OrderData[];
  };
};

type UserLanguage = "ro" | "ru";

type StatusMessages = {
  [K in UserLanguage]: {
    [S in OrderStatus]: string;
  };
};

export async function POST(request: Request) {
  try {
    const payload: WebhookPayload = await request.json();
    const locale = await getLocale() as UserLanguage;

    if (payload.type !== "records.after.update") {
      return NextResponse.json({ success: false, message: "Not a status update" });
    }

    const currentOrder = payload.data.rows[0];
    const previousOrder = payload.data.previous_rows[0];

    if (currentOrder.Status === previousOrder.Status) {
      return NextResponse.json({ success: false, message: "Status not changed" });
    }

    const userId = currentOrder.Utilizator.Id;

    const { rows: subscriptions } = await db.query(
      "SELECT endpoint, p256dh, auth FROM subscriptions WHERE user_id = $1",
      [userId]
    );

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No subscriptions found for user",
      });
    }

    webpush.setVapidDetails(
      "mailto:your-email@example.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const statusMessages: StatusMessages = {
      ro: {
        "Solicitare Primita": "Comanda dvs. a fost primită",
        "Comanda Confirmata": "Comanda dvs. a fost confirmată",
        "Transmis la Curier": "Comanda dvs. a fost transmisă la curier",
        "Comanda Finalizata": "Comanda dvs. a fost finalizată",
        "Retur": "Comanda dvs. este în proces de retur",
        "Anulata": "Comanda dvs. a fost anulată",
      },
      ru: {
        "Solicitare Primita": "Ваш заказ получен",
        "Comanda Confirmata": "Ваш заказ подтвержден",
        "Transmis la Curier": "Ваш заказ передан курьеру",
        "Comanda Finalizata": "Ваш заказ выполнен",
        "Retur": "Ваш заказ в процессе возврата",
        "Anulata": "Ваш заказ отменен",
      },
    };

    const notificationPayload = JSON.stringify({
      title: locale === "ro" ? "Actualizare comandă" : "Обновление заказа",
      body: `${statusMessages[locale][currentOrder.Status]} - ${currentOrder.Produs.Nume_Produs_RO}`,
      data: {
        url: "/dashboard/orders",
        orderId: currentOrder.Id,
      },
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub: any) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notificationPayload
        )
      )
    );

    const successful = results.filter((r: any) => r.status === "fulfilled").length;
    const failed = results.filter((r: any) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      message: `Sent to ${successful} devices, failed: ${failed}`,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process webhook",
        error: error.message,
      },
      { status: 500 }
    );
  }
}