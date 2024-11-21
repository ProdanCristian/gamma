import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.REVALIDATE_SECRET_TOKEN}`) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

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

    // If no specific tag provided, revalidate all
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
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.REVALIDATE_SECRET_TOKEN}`) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

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
