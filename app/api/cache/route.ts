import { NextResponse } from "next/server";
import { cache } from "@/lib/redis/cache";
import redis from "@/lib/redis/client";

export async function DELETE() {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        "nextjs:*",
        "COUNT",
        10000
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
