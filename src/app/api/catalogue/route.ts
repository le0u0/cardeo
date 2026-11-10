import { getI18n } from "@/lib/i18n-server";
import { NextResponse } from "next/server";
import { getCatalogue } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getCatalogue(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    const { t } = await getI18n();
    return NextResponse.json(
      { message: t("暫時無法載入卡牌，請重試。") },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
