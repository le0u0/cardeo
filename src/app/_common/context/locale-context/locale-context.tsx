"use client";
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createI18n, LOCALE_COOKIE, parseLocale, type Locale } from "@/lib/i18n";
import "./locale-context.css";

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
  function changeLanguage(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    // Reload keeps server content, metadata and the document language in sync.
    window.location.reload();
  }
  return (
    <div className="language-switch" role="group" aria-label={t("switchLanguage")}>
      <button type="button" lang="zh-Hant" aria-pressed={locale === "zh-Hant"} onClick={() => changeLanguage("zh-Hant")}>中文</button>
      <span aria-hidden="true">|</span>
      <button type="button" lang="en" aria-pressed={locale === "en"} onClick={() => changeLanguage("en")}>EN</button>
    </div>
  );
}
