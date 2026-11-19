"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import Link from "next/link";
import { Check, ArrowRight, Copy } from "lucide-react";
import { money, type Receipt } from "@/lib/types";
import { useCart } from "@/app/_common/context/cart-context/cart-context";
import "./receipt.css";
export function ReceiptView({ receipt }: { receipt: Receipt }) {
  const { t, locale } = useI18n();
  const cart = useCart();
  return (
    <div className="container receipt-page">
      <div className="receipt-heading">
        <span className="success-seal">
          <Check size={30} />
        </span>
        <h1>{t("yourCardsAreAllHere")}</h1>
        <p>{t("orderCompleteNotice")}</p>
      </div>
      <section className="receipt-paper">
        <div className="receipt-top">
          <div>
            <small>{t("demoOrderReference")}</small>
            <p>{receipt.reference}</p>
          </div>
          <button
            className="icon-button"
            aria-label={t("copyOrderReference")}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(receipt.reference);
                cart.notify(t("orderReferenceCopied"));
              } catch {
                cart.notify(t("copyReferenceFailed"));
              }
            }}
          >
            <Copy size={17} />
          </button>
        </div>
        <p className="receipt-date">
          {new Intl.DateTimeFormat(locale === "en" ? "en-HK" : "zh-HK", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Hong_Kong",
          }).format(new Date(receipt.createdAt))}{" "}
          {t("hongKongTime")}</p>
        <div className="receipt-items">
          {receipt.items.map((item, i) => (
            <div key={`${item.name}-${i}`}>
              <span>
                <strong>{item.name}</strong>
                <small>
                  {t("countCards", { count: item.quantity })} ×{" "}
                  {money(item.unitPrice)}
                </small>
              </span>
              <b>{money(item.unitPrice * item.quantity)}</b>
            </div>
          ))}
        </div>
        <div className="summary-line">
          <span>{t("demoDelivery")}</span>
          <span>HK$0.00</span>
        </div>
        <div className="summary-total">
          <span>{t("demoTotal")}</span>
          <strong>{money(receipt.total)}</strong>
        </div>
      </section>
      <div className="receipt-actions">
        <Link className="button primary" href="/shop">
          {t("findMoreCards")}<ArrowRight size={17} />
        </Link>
        <p>{t("receiptSessionNotice")}</p>
      </div>
    </div>
  );
}
