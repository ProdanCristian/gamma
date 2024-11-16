import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { getTranslations } from "next-intl/server";

export async function POST(req: Request) {
  try {
    const t = await getTranslations("auth");
    const { token, password, locale } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: t("missing_reset_info") },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const { rows } = await db.query(
      `SELECT * FROM "nc_pka4___Utilizatori" 
       WHERE "ResetToken" = $1 
       AND "ResetTokenExpiry" > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: t("invalid_reset_token") },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await db.query(
      `UPDATE "nc_pka4___Utilizatori" 
       SET "Password" = $1, 
           "ResetToken" = NULL, 
           "ResetTokenExpiry" = NULL 
       WHERE "ResetToken" = $2`,
      [hashedPassword, token]
    );

    return NextResponse.json({
      success: true,
      message: t("password_reset_success"),
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
