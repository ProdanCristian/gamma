import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: No valid session found" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { Nume, Prenume, Numar_Telefon, Email, Password, Provider } = body;

    let queryParams: any[] = [Nume, Prenume, Numar_Telefon, userId];
    let query = `
      UPDATE "nc_pka4___Utilizatori"
      SET "Nume" = $1, 
          "Prenume" = $2, 
          "Numar_Telefon" = $3
    `;

    if (Provider !== "google" && Provider !== "facebook") {
      query += `, "Email" = $${queryParams.length + 1}`;
      queryParams.push(Email);
    }

    if (Password && Provider === "credentials") {
      const hashedPassword = await bcrypt.hash(Password, 12);
      query += `, "Password" = $${queryParams.length + 1}`;
      queryParams.push(hashedPassword);
    }

    query += ` WHERE "id" = $4 RETURNING *`;

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = result.rows[0];

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          Nume: updatedUser.Nume,
          Prenume: updatedUser.Prenume,
          Email: updatedUser.Email,
          Numar_Telefon: updatedUser.Numar_Telefon,
          Provider: updatedUser.Provider,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error updating user profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
