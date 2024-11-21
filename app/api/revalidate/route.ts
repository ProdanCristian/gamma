import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag } = body;

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tag: tag,
        now: Date.now(),
      });
    }

    const tags = ["marketing", "categories", "products", "pixels"];
    tags.forEach((tag) => revalidateTag(tag));

    return NextResponse.json({
      revalidated: true,
      tags: tags,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const tags = ["marketing", "categories", "products", "pixels"];
    tags.forEach((tag) => revalidateTag(tag));

    return NextResponse.json({
      revalidated: true,
      tags: tags,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}
