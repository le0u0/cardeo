"use client";
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createI18n, LOCALE_COOKIE, parseLocale, type Locale } from "@/lib/i18n";

const LocaleContext = createContext(createI18n("zh-Hant"));
const subscribe = () => () => {};
function browserLocale() {
  const preference = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`));
  return parseLocale(preference?.split("=")[1]);
}
export function LocaleProvider({
  locale,
  children,
}: {
  locale?: Locale;
  children: ReactNode;
}) {
  const fallback = useSyncExternalStore(
    subscribe,
    browserLocale,
    () => locale ?? "zh-Hant",
  );
  const value = useMemo(() => createI18n(locale ?? fallback), [locale, fallback]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useI18n() {
  return useContext(LocaleContext);
}
export function LanguageSwitch() {
  const { locale, t } = useI18n();
  return (
    <select
      className="language-switch"
      aria-label={t("切換語言")}
      value={locale}
      onChange={(event) => {
        const next = event.target.value as Locale;
        document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
        // Reload keeps server content, metadata and the document language in sync.
        window.location.reload();
      }}
    >
      <option value="zh-Hant">繁體中文</option>
      <option value="en">English</option>
    </select>
  );
}
