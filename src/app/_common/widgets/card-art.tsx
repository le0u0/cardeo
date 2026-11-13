"use client";
import { useI18n } from "@/app/_common/providers/locale-provider";
import Image from "next/image";
import { useState } from "react";
import { Sword, Leaf, Orbit, Crown, Skull } from "lucide-react";
import type { Product } from "@/lib/types";
const symbols = {
  Ironclad: Sword,
  Silent: Leaf,
  Defect: Orbit,
  Regent: Crown,
  Necrobinder: Skull,
};
export function CardArt({
  product,
  priority = false,
  referenceArt = true,
}: {
  product: Product;
  priority?: boolean;
  referenceArt?: boolean;
}) {
  const { t } = useI18n();
  const Symbol = symbols[product.character];
  const [failed, setFailed] = useState(false);
  return (
    <div className={`card-art character-${product.character.toLowerCase()}`}>
      <div className="card-motif" aria-hidden="true">
        <span className="motif-orbit" />
        <Symbol strokeWidth={0.8} />
        <span className="motif-title">{product.name}</span>
      </div>
      {referenceArt && !failed && (
        <Image
          src={product.image_url}
          alt={t("valueCard", { p0: product.name })}
          fill
          sizes="(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 280px"
          priority={priority}
          className="reference-art"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
