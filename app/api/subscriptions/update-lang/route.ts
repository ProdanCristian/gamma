import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { lang } = await request.json();

    if (!lang || !['ro', 'ru'].includes(lang)) {
      return NextResponse.json(
        { success: false, message: "Invalid language" },
        { status: 400 }
      );
    }

    const result = await db.query(
      "UPDATE subscriptions SET lang = $1 RETURNING *",
      [lang]
    );

    console.log('Updated subscriptions:', result.rows);

    return NextResponse.json({ 
      success: true,
      updated: result.rowCount 
    });
  } catch (error: any) {
    console.error("Error updating subscription language:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 