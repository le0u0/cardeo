"use client";
import { useI18n } from "@/components/i18n/locale-provider";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="container page-pad empty-state page-empty">
      <h1>{t("暫時未能整理好貨架。")}</h1>
      <p>{t("請稍後重試。購物袋仍保留在你的瀏覽器中。")}</p>
      <button className="button primary" onClick={reset}>
        {t("重新載入")}</button>
    </div>
  );
}
