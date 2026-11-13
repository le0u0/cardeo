"use client";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useI18n } from "@/app/_common/providers/locale-provider";
import { useCart } from "@/app/_common/providers/cart-provider";
import { money } from "@/lib/types";

export function OrderSummary({ unavailable }: { unavailable: boolean }) {
  const { t } = useI18n();
  const cart = useCart();
  return (
    <aside className="order-summary">
      <h2>{t("orderSummary")}</h2>
      <div className="summary-line">
        <span>{t("cardSubtotal")}</span>
        <strong>{money(cart.total)}</strong>
      </div>
      <div className="summary-line">
        <span>{t("demoDelivery")}</span>
        <span>{t("free")}</span>
      </div>
      <div className="summary-total">
        <span>{t("total")}</span>
        <strong>{money(cart.total)}</strong>
      </div>
      {unavailable ? (
        <button className="button primary full" disabled>
          {t("removeUnavailableCardsFirst")}</button>
      ) : (
        <Link href="/checkout" className="button primary full">
          {t("continueToDemoCheckout")}<ArrowRight size={17} />
        </Link>
      )}
      <p className="summary-assurance">
        <ShieldCheck size={16} />
        {t("noPaymentRequired")}</p>
    </aside>
  );
}
