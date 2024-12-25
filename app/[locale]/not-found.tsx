import NotFoundPage from "@/components/not-found-page";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <NotFoundPage
      title={t("title")}
      description={t("description")}
      backHome={t("backHome")}
    />
  );
}
