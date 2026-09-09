import { NextRequest, NextResponse } from "next/server";
import { getProductsCatalog } from "@/lib/services/karmaxService";
import type { CatalogSortOption } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get("category") || undefined;
    const industrySlug = searchParams.get("industry") || undefined;
    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") as CatalogSortOption) || "name";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(48, parseInt(searchParams.get("limit") || "12", 10)));

    const result = await getProductsCatalog({
      categorySlug,
      industrySlug,
      search,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/products:", error);
    return NextResponse.json(
      { error: "Error al consultar los productos" },
      { status: 500 }
    );
  }
}
