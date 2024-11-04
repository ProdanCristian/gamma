import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const checkQuery = `
      SELECT "Emailuri" FROM public."nc_ssxn___Emailuri"
      WHERE "Emailuri" = $1;
    `;

    const existingEmail = await db.query(checkQuery, [email]);

    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "already_subscribed",
        },
        { status: 409 }
      );
    }

    const insertQuery = `
      INSERT INTO public."nc_ssxn___Emailuri" ("Emailuri")
      VALUES ($1);
    `;

    await db.query(insertQuery, [email]);

    return NextResponse.json(
      {
        success: true,
        message: "subscription_success",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding email:", error.message);
    console.error("Full error details:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add email",
      },
      { status: 500 }
    );
  }
}
