import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = {
      text: 'SELECT "Adresa" FROM "nc_pka4___Utilizatori" WHERE id = $1',
      values: [session.user.id],
    };

    const result = await db.query(query);
    const address = result.rows[0]?.Adresa;

    return NextResponse.json({
      address: address || null,
      exists: !!address,
    });
  } catch (error) {
    console.error("Caught error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
        address: null,
        exists: false,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.address) {
      return NextResponse.json(
        {
          error: "Address is required",
          success: false,
          exists: false,
        },
        { status: 400 }
      );
    }

    // Using raw SQL query to update the address
    const query = {
      text: 'UPDATE "nc_pka4___Utilizatori" SET "Adresa" = $1 WHERE id = $2 RETURNING "Adresa"',
      values: [body.address, session.user.id],
    };

    const result = await db.query(query);
    const updatedAddress = result.rows[0]?.Adresa;

    if (!updatedAddress) {
      throw new Error("Failed to update address");
    }

    return NextResponse.json({
      success: true,
      address: updatedAddress,
      exists: true,
    });
  } catch (error) {
    console.error("Caught error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
        success: false,
        exists: false,
      },
      { status: 500 }
    );
  }
}
