import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await db.query(
      'SELECT * FROM "nc_pka4___Utilizatori" WHERE "Email" = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    // Start a transaction
    await db.query('BEGIN');

    try {
      const result = await db.query(
        `INSERT INTO "nc_pka4___Utilizatori" 
         ("Email", "Password", "Nume", "Prenume", "Provider", "Is_verified", "created_at") 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
         RETURNING id, "Email", "Nume", "Prenume", "Is_verified"`,
        [email, hashedPassword, firstName, lastName, "credentials", false]
      );

      const newUser = result.rows[0];

      // Update any existing anonymous subscriptions with the new user's ID
      await db.query(
        `UPDATE subscriptions 
         SET user_id = $1, 
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id IS NULL`,
        [newUser.id]
      );

      // Commit the transaction
      await db.query('COMMIT');

      return NextResponse.json(
        {
          success: true,
          message: "Registration successful",
          user: {
            id: newUser.id,
            email: newUser.Email,
            firstName: newUser.Nume,
            lastName: newUser.Prenume,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      // Rollback the transaction if anything fails
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
