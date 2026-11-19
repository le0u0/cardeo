"use client";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";

export function EmptyCart() {
  const { t } = useI18n();
  return (
    <div className="empty-state page-empty">
      <ShoppingBag size={48} />
      <h2>{t("stillChoosingTakeYourTime")}</h2>
      <p>{t("emptyCartDescription")}</p>
      <Link href="/shop" className="button primary">
        {t("browseCards")}<ArrowRight size={17} />
      </Link>
    </div>
  );
}
