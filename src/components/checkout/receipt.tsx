"use client";
import { useI18n } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { Check, ArrowRight, Copy } from "lucide-react";
import { money, type Receipt } from "@/lib/types";
import { useCart } from "@/components/cart/cart-provider";
export function ReceiptView({ receipt }: { receipt: Receipt }) {
  const { t, locale } = useI18n();
  const cart = useCart();
  return (
    <div className="container receipt-page">
      <div className="receipt-heading">
        <span className="success-seal">
          <Check size={30} />
        </span>
        <h1>{t("好牌，已經集合。")}</h1>
        <p>{t("示範訂單已完成。沒有收款，也不會寄送任何商品。")}</p>
      </div>
      <section className="receipt-paper">
        <div className="receipt-top">
          <div>
            <small>{t("示範訂單編號")}</small>
            <p>{receipt.reference}</p>
          </div>
          <button
            className="icon-button"
            aria-label={t("複製訂單編號")}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(receipt.reference);
                cart.notify(t("訂單編號已複製。"));
              } catch {
                cart.notify(t("無法使用剪貼簿，請選取編號複製。"));
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
          {t("· 香港時間")}</p>
        <div className="receipt-items">
          {receipt.items.map((item, i) => (
            <div key={`${item.name}-${i}`}>
              <span>
                <strong>{item.name}</strong>
                <small>
                  {t("{count} 張", { count: item.quantity })} ×{" "}
                  {money(item.unitPrice)}
                </small>
              </span>
              <b>{money(item.unitPrice * item.quantity)}</b>
            </div>
          ))}
        </div>
        <div className="summary-line">
          <span>{t("模擬配送")}</span>
          <span>HK$0.00</span>
        </div>
        <div className="summary-total">
          <span>{t("示範合計")}</span>
          <strong>{money(receipt.total)}</strong>
        </div>
      </section>
      <div className="receipt-actions">
        <Link className="button primary" href="/shop">
          {t("繼續尋寶")}<ArrowRight size={17} />
        </Link>
        <p>{t("本頁收據只保留於目前分頁。關閉分頁後，可能無法再次查看。")}</p>
      </div>
    </div>
  );
}
