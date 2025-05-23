import { cache } from "@/lib/redis/cache";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const redis = await cache["getRedis"]();
    const script = `
      local keys = redis.call('keys', 'cache:*')
      local deletedCount = 0
      for i, key in ipairs(keys) do
        redis.call('del', key)
        deletedCount = deletedCount + 1
      end
      return deletedCount
    `;

    const deletedKeys = await (redis as any).eval(script, 0);

    return NextResponse.json({
      success: true,
      message: `Cache cleared successfully. Deleted ${deletedKeys} keys.`,
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear cache",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
