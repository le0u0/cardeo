"use client";
import { useI18n } from "@/providers/locale-provider";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="container page-pad empty-state page-empty">
      <h1>{t("shelvesUnavailable")}</h1>
      <p>{t("retryBagPreserved")}</p>
      <button className="button primary" onClick={reset}>
        {t("reload")}</button>
    </div>
  );
}
