import { NextResponse } from "next/server";
import webPush from "web-push";
import db from "@/lib/db";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateKey = process.env.VAPID_PRIVATE_KEY!;

webPush.setVapidDetails("mailto:info@gamma.md", publicKey, privateKey);

export async function POST(request: Request) {
  try {
    const subscription = await request.json();
    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    // Save subscription to database
    await db.query(
      `INSERT INTO subscriptions (endpoint, p256dh, auth)
       VALUES ($1, $2, $3)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         p256dh = $2,
         auth = $3,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [endpoint, p256dh, auth]
    );

    // Send welcome notification
    const payload = JSON.stringify({
      title: "Welcome to Gamma",
      body: "Thank you for enabling notifications!",
    });

    await webPush.sendNotification(subscription, payload);

    return NextResponse.json({
      message: "Subscription saved and notification sent",
    });
  } catch (error) {
    console.error("Error processing subscription:", error);
    return NextResponse.json(
      { error: "Error processing subscription" },
      { status: 500 }
    );
  }
}
