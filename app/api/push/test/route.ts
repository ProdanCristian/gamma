import { NextResponse } from "next/server";
import webpush from "web-push";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    // Configure VAPID keys
    webpush.setVapidDetails(
      "mailto:your-email@example.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    // Get all subscriptions from PostgreSQL
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
      title: "Test Notification",
      body: "This is a test push notification!",
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      image: "https://gamma.md/_next/image?url=https%3A%2F%2Fmedia.gamma.md%2Fdownload%2Fnoco%2Fpvszw82hcq9rw12%2Fm2as9zht2xzt7gy%2Fcd79df5hy7bgkwl%2Fimage-removebg_rtJIZ.png&w=1200&q=75",
      data: {
        url: "https://gamma.md/ro/shop/discounts",
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
