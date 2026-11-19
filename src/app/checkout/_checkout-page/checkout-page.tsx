"use client";
import { useI18n } from "@/app/_common/context/locale-context/locale-context";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/app/_common/context/cart-context/cart-context";
import { ReceiptView } from "@/app/_common/widgets/receipt/receipt";
import { EmptyCheckout } from "@/app/checkout/_empty-checkout/empty-checkout";
import { CheckoutPanels } from "@/app/checkout/_checkout-panels/checkout-panels";
import { CheckoutSummary } from "@/app/checkout/_checkout-summary/checkout-summary";
import { type CheckoutResult, type Receipt } from "@/lib/types";
export function CheckoutPage() {
  const { t } = useI18n();
  const cart = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [message, setMessage] = useState("");
  const [outcome, setOutcome] = useState<"success" | "failure">("success");
  const [quote, setQuote] = useState<{ total: number; cart: string } | null>(
    null,
  );
  const [inlineReceipt, setInlineReceipt] = useState<Receipt | null>(null);
  const request = useRef<{ key: string; signature: string } | null>(null);
  const signature = JSON.stringify(cart.items);
  const activeQuote = quote?.cart === signature ? quote : null;
  const total = activeQuote?.total ?? cart.total;
  if (inlineReceipt) return <ReceiptView receipt={inlineReceipt} />;
  if (!cart.ready)
    return <div className="container page-pad">{t("loadingYourBag")}</div>;
  if (!cart.items.length) return <EmptyCheckout />;
  const unavailable = cart.items.some(
    (i) => !cart.products.find((p) => p.id === i.productId),
  );
  async function submit() {
    if (busy.current || unavailable) return;
    busy.current = true;
    setPending(true);
    setMessage("");
    try {
      const payloadSignature = signature + outcome;
      if (!request.current || request.current.signature !== payloadSignature)
        request.current = {
          key: crypto.randomUUID(),
          signature: payloadSignature,
        };
      const response = await fetch("/api/demo-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          expectedTotal: total,
          requestKey: request.current.key,
          outcome,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = (await response.json()) as CheckoutResult & {
        message?: string;
      };
      if (result.kind === "requote") {
        setQuote({ total: result.total, cart: signature });
        setMessage(
          t("checkoutPriceChanged"),
        );
        return;
      }
      if (result.kind !== "completed") {
        const messages = {
          failed: t("checkoutSimulationFailed"),
          invalid: t("checkoutCardUnavailable"),
          conflict: t("checkoutOrderChanged"),
          limited: t("checkoutRateLimited"),
        };
        setMessage(
          result.kind in messages
            ? messages[result.kind as keyof typeof messages]
            : t("checkoutUnavailable"),
        );
        return;
      }
      try {
        sessionStorage.setItem(
          "cardeo.receipt.v1",
          JSON.stringify(result.receipt),
        );
      } catch {
        cart.clear();
        setInlineReceipt(result.receipt);
        return;
      }
      cart.clear();
      router.push("/checkout/success");
    } catch {
      setMessage(
        t("checkoutConnectionInterrupted"),
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <div className="container page-pad">
      <Link className="quiet-link back-link" href="/cart">
        <ArrowLeft size={16} />
        {t("backToYourBag")}</Link>
      <div className="page-heading">
        <h1>{t("tryTheCheckout")}</h1>
        <p>{t("checkoutPrivacyNotice")}</p>
      </div>
      <div className="checkout-layout">
        <CheckoutPanels
          outcome={outcome}
          onOutcomeChange={setOutcome}
          pending={pending}
        />
        <CheckoutSummary
          total={total}
          quoted={!!activeQuote}
          unavailable={unavailable}
          message={message}
          pending={pending}
          onSubmit={submit}
        />
      </div>
    </div>
  );
}
