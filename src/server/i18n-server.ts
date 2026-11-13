import "server-only";
import { cookies } from "next/headers";
import { createI18n, LOCALE_COOKIE, parseLocale } from "../lib/i18n";

export async function getI18n() {
  const store = await cookies();
  return createI18n(parseLocale(store.get(LOCALE_COOKIE)?.value));
}
