import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag, path } = body;

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tag: tag,
        now: Date.now(),
      });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        path: path,
        now: Date.now(),
      });
    }

    // Revalidate all common tags if no specific tag or path is provided
    const tags = ["marketing", "categories", "products", "pixels"];
    tags.forEach((tag) => revalidateTag(tag));
    
    // Revalidate main paths
    const paths = ["/", "/ro", "/ru"];
    paths.forEach((path) => revalidatePath(path));

    return NextResponse.json({
      revalidated: true,
      tags: tags,
      paths: paths,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');
    const path = searchParams.get('path');

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tag: tag,
        now: Date.now(),
      });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        path: path,
        now: Date.now(),
      });
    }

    // Revalidate all common tags if no specific tag or path is provided
    const tags = ["marketing", "categories", "products", "pixels"];
    tags.forEach((tag) => revalidateTag(tag));
    
    // Revalidate main paths
    const paths = ["/", "/ro", "/ru"];
    paths.forEach((path) => revalidatePath(path));

    return NextResponse.json({
      revalidated: true,
      tags: tags,
      paths: paths,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
