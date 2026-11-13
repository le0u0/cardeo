"use client";
import { type RefObject } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/app/_common/providers/locale-provider";
import { FilterFields, type Filters } from "@/app/shop/_widgets/filter-fields";
type Update = (entries: Record<string, string | number>) => void;
export function FilterDrawer({
  drawer,
  draft,
  setDraft,
  update,
  maxPrice,
}: {
  drawer: RefObject<HTMLDialogElement | null>;
  draft: Filters;
  setDraft: (next: Filters | ((old: Filters) => Filters)) => void;
  update: Update;
  maxPrice: number;
}) {
  const { t } = useI18n();
  return (
    <dialog
      ref={drawer}
      className="side-dialog"
      aria-labelledby="filter-title"
    >
      <form
        className="dialog-inner"
        onSubmit={(e) => {
          e.preventDefault();
          update(draft);
          drawer.current?.close();
        }}
      >
        <div className="dialog-heading">
          <h2 id="filter-title">{t("filterCards")}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label={t("cancelFilters")}
            onClick={() => drawer.current?.close()}
          >
            <X />
          </button>
        </div>
        <FilterFields
          value={draft}
          change={(key, value) =>
            setDraft((old) => ({ ...old, [key]: value }))
          }
          prefix="mobile"
        />
        <div className="drawer-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              setDraft({ character: "all", max: maxPrice })
            }
          >
            {t("reset")}</button>
          <button className="button primary" type="submit">
            {t("showResults")}</button>
        </div>
      </form>
    </dialog>
  );
}
