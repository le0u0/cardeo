"use client";
import { LocaleProvider, useI18n } from "@/providers/locale-provider";
export default function GlobalError({ reset }: { reset: () => void }) {
  return <LocaleProvider><GlobalErrorContent reset={reset} /></LocaleProvider>;
}
function GlobalErrorContent({ reset }: { reset: () => void }) {
  const { t, locale } = useI18n();
  return (
    <html lang={locale}>
      <body
        style={{
          background: "#f7f6f2",
          color: "#292824",
          fontFamily: "sans-serif",
          padding: "10vw",
          lineHeight: 1.8,
        }}
      >
        <h1>{t("shopUnavailable")}</h1>
        <p>{t("weCannotLoadTheCardsRightNow")}</p>
        <button
          onClick={reset}
          style={{ padding: "12px 24px", fontSize: 16, cursor: "pointer" }}
        >
          {t("reload")}</button>
      </body>
    </html>
  );
}
