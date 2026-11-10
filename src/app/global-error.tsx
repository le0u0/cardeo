"use client";
import { LocaleProvider, useI18n } from "@/components/i18n/locale-provider";
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
        <h1>{t("小店暫時未能開門。")}</h1>
        <p>{t("卡牌資料暫時無法讀取，請稍後重試。購物袋保留在你的瀏覽器中。")}</p>
        <button
          onClick={reset}
          style={{ padding: "12px 24px", fontSize: 16, cursor: "pointer" }}
        >
          {t("重新載入")}</button>
      </body>
    </html>
  );
}
