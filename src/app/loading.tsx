import { getI18n } from "@/server/i18n/i18n-server";
import "./loading.css";
export default async function Loading() {
  const { t } = await getI18n();
  return (
    <div className="container page-pad" role="status">
      <p>{t("loadingShelves")}</p>
      <div className="loading-shelves">
        {[1, 2, 3, 4].map((i) => (
          <div className="loading-card" key={i} />
        ))}
      </div>
    </div>
  );
}
