import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.getAll("ids");

    if (!ids.length) {
      return NextResponse.json(
        { success: false, error: "Product IDs are required" },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    const { rows } = await db.query(
      `SELECT id, "Stock" FROM public."nc_pka4__Produse" WHERE id = ANY($1)`,
      [ids]
    );

    const stockData = rows.reduce((acc, row) => {
      acc[row.id] = row.Stock;
      return acc;
    }, {});

    return NextResponse.json(
      {
        success: true,
        data: stockData,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock" },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = request.nextUrl;
    const productId = searchParams.get("productId");
    const body = await request.json();
    const { quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    // First get current stock
    const { rows: currentStock } = await db.query(
      `SELECT "Stock" FROM public."nc_pka4__Produse" WHERE id = $1`,
      [productId]
    );

    if (!currentStock.length) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const newStock = Math.max(0, currentStock[0].Stock - quantity);

    // Update the stock
    const { rowCount } = await db.query(
      `UPDATE public."nc_pka4__Produse" SET "Stock" = $1 WHERE id = $2`,
      [newStock, productId]
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to update stock" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { newStock },
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update stock" },
      { status: 500 }
    );
  }
}
