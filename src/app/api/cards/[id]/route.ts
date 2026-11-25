import { NextResponse } from "next/server";
import { getCard } from "@/server/database/database";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9_-]{1,100}$/.test(id)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  try { const card = await getCard(id); return card ? NextResponse.json(card) : NextResponse.json({ message: "Not found" }, { status: 404 }); }
  catch { return NextResponse.json({ message: "Catalogue unavailable" }, { status: 503 }); }
}
