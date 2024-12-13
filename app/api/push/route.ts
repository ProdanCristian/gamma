import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const subscription = await request.json();
    const session = await getServerSession(authOptions);
    let userId = null;

    // If user is authenticated, get their ID
    if (session?.user?.email) {
      const { rows: users } = await db.query(
        `SELECT id FROM "nc_pka4___Utilizatori" WHERE Email = $1`,
        [session.user.email]
      );
      if (users.length > 0) {
        userId = users[0].id;
      }
    }

    // Check for existing subscription
    const { rows: existing } = await db.query(
      "SELECT id FROM subscriptions WHERE endpoint = $1",
      [subscription.endpoint]
    );

    if (existing.length > 0) {
      // Update existing subscription and link to user if authenticated
      await db.query(
        `UPDATE subscriptions 
         SET p256dh = $1, 
             auth = $2, 
             user_id = COALESCE($4, user_id),
             updated_at = CURRENT_TIMESTAMP
         WHERE endpoint = $3`,
        [
          subscription.keys.p256dh,
          subscription.keys.auth,
          subscription.endpoint,
          userId
        ]
      );
    } else {
      // Insert new subscription
      await db.query(
        `INSERT INTO subscriptions (endpoint, p256dh, auth, user_id)
         VALUES ($1, $2, $3, $4)`,
        [
          subscription.endpoint,
          subscription.keys.p256dh,
          subscription.keys.auth,
          userId
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
