import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || "https://karmax.mx",
  "https://karmax.mx",
  "https://karmax-beta.vercel.app/",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  if (!isApiRoute) {
    return NextResponse.next();
  }

  // Determine allowed origin
  let allowOrigin = "*";
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== "production") {
      allowOrigin = origin;
    }
  }

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
    "Access-Control-Allow-Headers":
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Anti-Bot-Token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (allowOrigin !== "*") {
    corsHeaders["Access-Control-Allow-Credentials"] = "true";
  }

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Process standard request and attach CORS headers
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
