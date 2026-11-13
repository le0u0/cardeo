"use client";
import { MapPin, Package, ShieldCheck } from "lucide-react";
import { useI18n } from "@/app/_common/providers/locale-provider";

export function CheckoutPanels({
  outcome,
  onOutcomeChange,
  pending,
}: {
  outcome: "success" | "failure";
  onOutcomeChange: (value: "success" | "failure") => void;
  pending: boolean;
}) {
  const { t } = useI18n();
  return (
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
                onChange={() => onOutcomeChange(value)}
              />
              {value === "success" ? t("simulateSuccess") : t("simulateFailure")}
            </label>
          ))}
        </div>
        <p className="fine-print">
          {t("paymentServiceNotice")}</p>
      </section>
    </div>
  );
}
