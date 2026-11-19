"use client";
import Link from "next/link";
import { Package } from "lucide-react";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";

export function EmptyCheckout() {
  const { t } = useI18n();
  return (
    <div className="container page-pad empty-state page-empty">
      <Package size={42} />
      <h1>{t("yourBagIsStillEmpty")}</h1>
      <p>{t("pickAFewCardsThenComeBack")}</p>
      <Link href="/shop" className="button primary">
        {t("browseCards")}</Link>
    </div>
  );
}
