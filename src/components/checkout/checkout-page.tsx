"use client";
import { useI18n } from "@/components/i18n/locale-provider";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Package,
  LoaderCircle,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { ReceiptView } from "@/components/checkout/receipt";
import { money, type CheckoutResult, type Receipt } from "@/lib/types";
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
  if (!cart.items.length)
    return (
      <div className="container page-pad empty-state page-empty">
        <Package size={42} />
        <h1>{t("yourBagIsStillEmpty")}</h1>
        <p>{t("pickAFewCardsThenComeBack")}</p>
        <Link href="/shop" className="button primary">
          {t("browseCards")}</Link>
      </div>
    );
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
        <div className="checkout-sections">
          <section className="checkout-panel">
            <h2>
              <MapPin size={20} />
              {t("demoDeliveryDetails")}</h2>
            <div className="fictional-address">
              <strong>{t("demoCustomer")}</strong>
              <p>{t("hongKongDemoAddress")}</p>
              <span>{t("fictionalDeliveryDetailsNotice")}</span>
            </div>
          </section>
          <section className="checkout-panel">
            <h2>
              <Package size={20} />
              {t("deliveryMethod")}</h2>
            <div className="delivery-option">
              <span>
                <strong>{t("demoDelivery")}</strong>
                <small>{t("nothingWillBeDelivered")}</small>
              </span>
              <b>{t("free")}</b>
            </div>
          </section>
          <section className="checkout-panel">
            <h2>
              <ShieldCheck size={20} />
              {t("checkoutSimulator")}</h2>
            <p>{t("checkoutSimulationInstructions")}</p>
            <div className="simulation-options">
              {(["success", "failure"] as const).map((value) => (
                <label
                  key={value}
                  className={outcome === value ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="outcome"
                    value={value}
                    checked={outcome === value}
                    disabled={pending}
                    onChange={() => setOutcome(value)}
                  />
                  {value === "success" ? t("simulateSuccess") : t("simulateFailure")}
                </label>
              ))}
            </div>
            <p className="fine-print">
              {t("paymentServiceNotice")}</p>
          </section>
        </div>
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
            <span>{activeQuote ? t("updatedTotal") : t("demoTotal")}</span>
            <strong>{money(total)}</strong>
          </div>
          {activeQuote && (
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
            onClick={submit}
          >
            {pending ? (
              <>
                <LoaderCircle className="spinner" size={18} />
                {t("confirming")}</>
            ) : (
              <>
                {activeQuote ? t("acceptNewTotalAndPlaceDemoOrder") : t("placeDemoOrder")}
                <ArrowRight size={17} />
              </>
            )}
          </button>
          <p className="summary-assurance">
            <ShieldCheck size={16} />
            {t("demoAmountsNotice")}</p>
        </aside>
      </div>
    </div>
  );
}
