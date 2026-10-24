import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const rawPath = typeof body?.path === "string" ? body.path.trim() : "";

    if (!rawPath || !rawPath.startsWith("/")) {
      return NextResponse.json({ ok: false, error: "Invalid path" }, { status: 400 });
    }

    // Ignore admin, internal Next.js assets, or api routes
    if (
      rawPath.startsWith("/admin") ||
      rawPath.startsWith("/api") ||
      rawPath.startsWith("/_next") ||
      rawPath.includes("favicon")
    ) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Normalize: remove trailing slash (unless it's just '/')
    const normalizedPath =
      rawPath.length > 1 && rawPath.endsWith("/")
        ? rawPath.replace(/\/+$/, "")
        : rawPath;

    // Safety: max 255 chars
    const safePath = normalizedPath.slice(0, 255);

    // Atomic increment: 1 single lightweight query
    await pool.query(
      `INSERT INTO page_views (path, views, updated_at)
       VALUES (?, 1, NOW())
       ON DUPLICATE KEY UPDATE
         views = views + 1,
         updated_at = NOW()`,
      [safePath]
    );

    return NextResponse.json({ ok: true }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error updating page visits:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
