import { getI18n } from "@/server/i18n/i18n-server";
import { NextResponse } from "next/server";
import { getCatalogue } from "@/server/database/database";


export async function GET() {
  try {
    return NextResponse.json(await getCatalogue(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    const { t } = await getI18n();
    return NextResponse.json(
      { message: t("catalogueLoadFailed") },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
