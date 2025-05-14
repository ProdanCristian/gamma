import { NextResponse } from "next/server";
import webpush from "web-push";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { notifications } = await request.json();
    console.log('Received notifications:', notifications);

    if (!notifications?.ro || !notifications?.ru) {
      return NextResponse.json(
        { success: false, message: "Notifications content required for both languages" },
        { status: 400 }
      );
    }

    webpush.setVapidDetails(
      "mailto:your-email@example.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const { rows: subscriptions } = await db.query(
      "SELECT endpoint, p256dh, auth, lang FROM subscriptions"
    );
    console.log('Subscriptions found:', subscriptions);

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No subscriptions found",
      });
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub: any) => {
        const userLang = sub.lang || 'ro';
        const notification = notifications[userLang];
        console.log('Sending notification for lang:', userLang, notification);

        if (!notification) {
          console.error('No notification content for language:', userLang);
          return Promise.reject('No notification content for language: ' + userLang);
        }

        const payload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          data: {
            url: notification.url || "https://gamma.md",
          },
        });

        return webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
      })
    );

    console.log('Send results:', results);

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
