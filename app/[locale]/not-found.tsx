import NotFoundMessage from "@/components/not-found/message";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <NotFoundMessage
      title={t("title")}
      description={t("description")}
      backHome={t("backHome")}
    />
  );
}
