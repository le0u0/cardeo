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
    return <div className="container page-pad">{t("正在讀取購物袋…")}</div>;
  if (!cart.items.length)
    return (
      <div className="container page-pad empty-state page-empty">
        <Package size={42} />
        <h1>{t("購物袋還是空的。")}</h1>
        <p>{t("先選幾張卡牌，再回來體驗示範結帳。")}</p>
        <Link href="/shop" className="button primary">
          {t("瀏覽卡牌")}</Link>
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
          t("價格已更新。請核對下方新合計，再按「接受新合計並模擬訂單」。"),
        );
        return;
      }
      if (result.kind !== "completed") {
        const messages = {
          failed: t("模擬付款失敗。購物袋仍然保留，請選擇成功後重試。"),
          invalid: t("有卡牌無法購買，請返回購物袋檢查。"),
          conflict: t("訂單內容已變更，請重新載入結帳頁。"),
          limited: t("嘗試次數較多，請於 15 分鐘後再試。"),
        };
        setMessage(
          result.kind in messages
            ? messages[result.kind as keyof typeof messages]
            : t("結帳暫時無法使用。購物袋仍然保留，請稍後重試。"),
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
        t("連線未完成。購物袋仍然保留，請重試；重複請求不會建立第二張訂單。"),
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
        {t("返回購物袋")}</Link>
      <div className="page-heading">
        <h1>{t("來，試一次結帳。")}</h1>
        <p>{t("不用留下個人資料。這張訂單，只為示範而生。")}</p>
      </div>
      <div className="checkout-layout">
        <div className="checkout-sections">
          <section className="checkout-panel">
            <h2>
              <MapPin size={20} />
              {t("模擬配送資料")}</h2>
            <div className="fictional-address">
              <strong>{t("示範顧客")}</strong>
              <p>{t("香港 · 示範地址")}</p>
              <span>{t("系統提供的虛構資料，無需填寫真實姓名或聯絡方式。")}</span>
            </div>
          </section>
          <section className="checkout-panel">
            <h2>
              <Package size={20} />
              {t("配送方式")}</h2>
            <div className="delivery-option">
              <span>
                <strong>{t("模擬配送")}</strong>
                <small>{t("不會實際寄送商品")}</small>
              </span>
              <b>{t("免費")}</b>
            </div>
          </section>
          <section className="checkout-panel">
            <h2>
              <ShieldCheck size={20} />
              {t("結帳模擬器")}</h2>
            <p>{t("選擇結果，試試順利完成或付款失敗時的購物流程。")}</p>
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
                  {value === "success" ? t("模擬成功") : t("模擬失敗")}
                </label>
              ))}
            </div>
            <p className="fine-print">
              {t("沒有串接真實付款服務，不會要求信用卡資料。")}</p>
          </section>
        </div>
        <aside className="order-summary checkout-summary">
          <h2>{t("最後確認")}</h2>
          <ul className="checkout-items">
            {cart.items.map((item) => {
              const p = cart.products.find((p) => p.id === item.productId);
              return (
                <li key={item.productId}>
                  <div>
                    <strong>{p?.name ?? t("已下架卡牌")}</strong>
                    <small>
                      {t("{count} 張", { count: item.quantity })}
                    </small>
                  </div>
                  <span>{money((p?.price_minor ?? 0) * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="summary-line">
            <span>{t("模擬配送")}</span>
            <span>{t("免費")}</span>
          </div>
          <div className="summary-total">
            <span>{activeQuote ? t("更新後合計") : t("示範合計")}</span>
            <strong>{money(total)}</strong>
          </div>
          {activeQuote && (
            <p className="fine-print">
              {t("單項價格以伺服器為準；上方列表為加入購物袋時的預覽價格。最終收據將顯示更新後的單價。")}</p>
          )}
          {unavailable && (
            <p className="alert" role="alert">
              {t("有卡牌已下架，請返回購物袋移除。")}</p>
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
                {t("正在確認…")}</>
            ) : (
              <>
                {activeQuote ? t("接受新合計並模擬訂單") : t("模擬訂單")}
                <ArrowRight size={17} />
              </>
            )}
          </button>
          <p className="summary-assurance">
            <ShieldCheck size={16} />
            {t("所有金額只供示範，不會收款。")}</p>
        </aside>
      </div>
    </div>
  );
}
