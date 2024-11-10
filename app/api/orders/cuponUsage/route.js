import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "checkout.login_required" },
        { status: 401 }
      );
    }

    const { couponCode } = await req.json();

    const coupon = await db.query(
      `SELECT id, "Cupon", "Disponibil_Pina", "Reducere" 
       FROM "nc_ssxn___Cupoane" 
       WHERE "Cupon" = $1`,
      [couponCode]
    );

    if (coupon.rows.length === 0) {
      return NextResponse.json(
        { error: "checkout.coupon_invalid" },
        { status: 400 }
      );
    }

    const couponData = coupon.rows[0];

    if (new Date(couponData.Disponibil_Pina) < new Date()) {
      return NextResponse.json(
        { error: "checkout.coupon_expired" },
        { status: 400 }
      );
    }

    const usageCheck = await db.query(
      `SELECT id FROM "nc_pka4__Coupon_Usage" 
       WHERE user_id = $1 AND coupon_id = $2`,
      [session.user.id, couponData.id]
    );

    if (usageCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "checkout.coupon_already_used" },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO "nc_pka4__Coupon_Usage" (user_id, coupon_id, used_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)`,
      [session.user.id, couponData.id]
    );

    return NextResponse.json({
      success: true,
      discount: couponData.Reducere,
      message: "checkout.coupon_applied",
    });
  } catch (error) {
    console.error("Coupon application error:", error);
    return NextResponse.json(
      { error: "checkout.generic_error" },
      { status: 500 }
    );
  }
}
