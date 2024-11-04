import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { name, phone, email, message, to } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Store contact form submission in database
    await db.query(
      `INSERT INTO "nc_pka4___Contact_Forms" 
       ("Name", "Email", "Phone", "Message", "created_at") 
       VALUES ($1, $2, $3, $4, NOW())`,
      [name, email, phone, message]
    );

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
