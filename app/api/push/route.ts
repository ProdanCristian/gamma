import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const subscription = await request.json();
    console.log("Received subscription:", subscription);

    // First try to find existing subscription
    const { rows: existing } = await db.query(
      "SELECT id FROM subscriptions WHERE endpoint = $1",
      [subscription.endpoint]
    );

    if (existing.length > 0) {
      // Update existing subscription
      await db.query(
        `UPDATE subscriptions 
         SET p256dh = $1, auth = $2, updated_at = CURRENT_TIMESTAMP
         WHERE endpoint = $3`,
        [
          subscription.keys.p256dh,
          subscription.keys.auth,
          subscription.endpoint,
        ]
      );
    } else {
      // Insert new subscription
      await db.query(
        `INSERT INTO subscriptions (endpoint, p256dh, auth)
         VALUES ($1, $2, $3)`,
        [
          subscription.endpoint,
          subscription.keys.p256dh,
          subscription.keys.auth,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription saved",
    });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Error processing subscription" },
      { status: 500 }
    );
  }
}
