"use client";
import { useI18n } from "@/providers/locale-provider";
import { Minus, Plus } from "lucide-react";
export function Quantity({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="quantity">
      <button
        type="button"
        aria-label={t("decreaseValueQuantity", { p0: name })}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
      >
        <Minus size={14} />
      </button>
      <output aria-label={t("valueQuantity", { p0: name })}>{value}</output>
      <button
        type="button"
        aria-label={t("increaseValueQuantity", { p0: name })}
        onClick={() => onChange(value + 1)}
        disabled={value >= 10}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
