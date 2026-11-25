import { NextRequest, NextResponse } from "next/server";
import { listCards } from "@/server/database/database";
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const ids = q.getAll("id");
  const page = Number(q.get("page") || 1);
  const limit = Number(q.get("limit") || 12);
  const max = q.has("max") ? Number(q.get("max")) : undefined;
  const sort = q.get("sort") || "featured";
  if (!Number.isInteger(page) || page < 1 || page > 10000 || !Number.isInteger(limit) || limit < 1 || limit > 30 || ids.length > 30 || ids.some(id => !/^[a-z0-9_-]{1,100}$/.test(id)) || (max !== undefined && (!Number.isInteger(max) || max < 0 || max > 3000000)) || !["featured", "name", "price-asc", "price-desc"].includes(sort) || (q.get("keyword") || "").length > 100) return NextResponse.json({ message: "Invalid catalogue parameters" }, { status: 400 });
  try {
    const data = await listCards({ className: q.get("class") || undefined, keyword: q.get("keyword") || "", sort, page, limit, maxPrice: max, ids: ids.length ? ids : undefined });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ message: "Catalogue unavailable" }, { status: 503 }); }
}
