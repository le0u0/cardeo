"use client";
import { useI18n } from "@/app/providers/locale-provider";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { ReceiptView } from "@/app/widgets/receipt";
import { type Receipt } from "@/lib/types";
function snapshot() {
  try {
    return sessionStorage.getItem("cardeo.receipt.v1") ?? "";
  } catch {
    return "";
  }
}
function receiptFrom(raw: string): Receipt | null {
  try {
    const r = JSON.parse(raw) as Receipt;
    if (
      !/^DEMO-[A-F0-9]{16}$/.test(r.reference) ||
      !Number.isFinite(Date.parse(r.createdAt)) ||
      r.currency !== "HKD" ||
      !Number.isSafeInteger(r.total) ||
      r.total < 0 ||
      !Array.isArray(r.items) ||
      !r.items.length ||
      r.items.length > 30
    )
      return null;
    if (
      r.items.some(
        (i) =>
          typeof i.name !== "string" ||
          !Number.isSafeInteger(i.unitPrice) ||
          i.unitPrice < 0 ||
          !Number.isInteger(i.quantity) ||
          i.quantity < 1 ||
          i.quantity > 10,
      )
    )
      return null;
    if (r.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) !== r.total)
      return null;
    return r;
  } catch {
    return null;
  }
}
const subscribe = () => () => {};
export function SuccessPage() {
  const { t } = useI18n();
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const receipt = receiptFrom(raw);
  return receipt ? (
    <ReceiptView receipt={receipt} />
  ) : (
    <div className="container page-pad empty-state page-empty">
      <FileQuestion size={44} />
      <h1>{t("noReceiptHereYet")}</h1>
      <p>{t("receiptUnavailableNotice")}</p>
      <Link href="/shop" className="button primary">
        {t("backToTheShop")}</Link>
    </div>
  );
}
