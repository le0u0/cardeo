"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
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
