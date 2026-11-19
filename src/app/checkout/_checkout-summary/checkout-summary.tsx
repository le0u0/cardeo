"use client";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useCart } from "@/app/_common/context/cart-context/cart-context";
import { money } from "@/lib/types";
import "./checkout-summary.css";

export function CheckoutSummary({
  total,
  quoted,
  unavailable,
  message,
  pending,
  onSubmit,
}: {
  total: number;
  quoted: boolean;
  unavailable: boolean;
  message: string;
  pending: boolean;
  onSubmit: () => void;
}) {
  const { t } = useI18n();
  const cart = useCart();
  return (
    <aside className="order-summary checkout-summary">
      <h2>{t("reviewYourOrder")}</h2>
      <ul className="checkout-items">
        {cart.items.map((item) => {
          const p = cart.products.find((p) => p.id === item.productId);
          return (
            <li key={item.productId}>
              <div>
                <strong>{p?.name ?? t("unavailableCard")}</strong>
                <small>
                  {t("countCards", { count: item.quantity })}
                </small>
              </div>
              <span>{money((p?.price_minor ?? 0) * item.quantity)}</span>
            </li>
          );
        })}
      </ul>
      <div className="summary-line">
        <span>{t("demoDelivery")}</span>
        <span>{t("free")}</span>
      </div>
      <div className="summary-total">
        <span>{quoted ? t("updatedTotal") : t("demoTotal")}</span>
        <strong>{money(total)}</strong>
      </div>
      {quoted && (
        <p className="fine-print">
          {t("finalPricesNotice")}</p>
      )}
      {unavailable && (
        <p className="alert" role="alert">
          {t("checkoutRemoveUnavailableCard")}</p>
      )}
      {message && (
        <p className="alert" role="alert">
          {message}
        </p>
      )}
      <button
        className="button primary full"
        disabled={pending || unavailable}
        onClick={onSubmit}
      >
        {pending ? (
          <>
            <LoaderCircle className="spinner" size={18} />
            {t("confirming")}</>
        ) : (
          <>
            {quoted ? t("acceptNewTotalAndPlaceDemoOrder") : t("placeDemoOrder")}
            <ArrowRight size={17} />
          </>
        )}
      </button>
      <p className="summary-assurance">
        <ShieldCheck size={16} />
        {t("demoAmountsNotice")}</p>
    </aside>
  );
}
