import { NextResponse } from "next/server";
import webPush, { PushSubscription } from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateKey = process.env.VAPID_PRIVATE_KEY!;

webPush.setVapidDetails("mailto:info@gamma.md", publicKey, privateKey);

export async function POST(request: Request) {
  try {
    const subscription = (await request.json()) as PushSubscription;

    const payload = JSON.stringify({
      title: "Welcome to Gamma",
      body: "Thank you for enabling notifications!",
    });

    await webPush.sendNotification(subscription, payload);

    return NextResponse.json({ message: "Notification sent" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error sending notification" },
      { status: 500 }
    );
  }
}
