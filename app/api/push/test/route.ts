import { NextResponse } from "next/server";
import webpush from "web-push";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { title, body, url } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400 }
      );
    }

    webpush.setVapidDetails(
      "mailto:your-email@example.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const { rows: subscriptions } = await db.query(
      "SELECT endpoint, p256dh, auth FROM subscriptions"
    );

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No subscriptions found",
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: {
        url: url || "https://gamma.md",
      },
    });

    // Send to all subscriptions
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
          payload
        )
      )
    );

    const successful = results.filter(
      (r: any) => r.status === "fulfilled"
    ).length;
    const failed = results.filter((r: any) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      message: `Sent to ${successful} devices, failed: ${failed}`,
      details: results,
    });
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send notification",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
