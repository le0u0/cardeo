import { getI18n } from "@/lib/i18n-server";
export default async function Loading() {
  const { t } = await getI18n();
  return (
    <div className="container page-pad" role="status">
      <p>{t("商人正在整理貨架…")}</p>
      <div className="loading-shelves">
        {[1, 2, 3, 4].map((i) => (
          <div className="loading-card" key={i} />
        ))}
      </div>
    </div>
  );
}
