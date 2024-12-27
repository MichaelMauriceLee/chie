import DictionaryInput from "@/components/dictionary-input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DictionaryResult from "@/components/dictionary-result";
import SettingsDialog from "@/components/settings-dialog";
import ErrorBoundary from "@/components/error-boundary";
import { getTranslations } from "next-intl/server";

const LOCALE_LANGUAGE_MAP = {
  en: "English",
  ja: "Japanese",
};

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const [
    metadataLabels,
    settingsDialogLabels,
    dictionaryInputLabels,
    errorBoundaryLabels,
    resolvedParams,
    resolvedSearchParams,
  ] = await Promise.all([
    getTranslations("Metadata"),
    getTranslations("SettingsDialog"),
    getTranslations("DictionaryInput"),
    getTranslations("ErrorBoundary"),
    params,
    searchParams,
  ]);

  const { locale } = resolvedParams;
  const { query } = resolvedSearchParams;

  const languageName =
    LOCALE_LANGUAGE_MAP[locale as keyof typeof LOCALE_LANGUAGE_MAP] ||
    "English";

  return (
    <div className="min-h-screen px-10 pt-4 flex flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-6xl font-bold">{metadataLabels("title")}</h1>
        <SettingsDialog
          i18n={{
            title: settingsDialogLabels("title"),
            description: settingsDialogLabels("description"),
            saveButton: settingsDialogLabels("saveButton"),
            ariaLabel: settingsDialogLabels("aria.settings"),
            locale: {
              title: settingsDialogLabels("locale.title"),
              en: settingsDialogLabels("locale.en"),
              ja: settingsDialogLabels("locale.ja"),
            },
            anki: {
              title: settingsDialogLabels("anki.title"),
              syncButton: settingsDialogLabels("anki.syncButton"),
              selectDeck: settingsDialogLabels("anki.selectDeck"),
              placeholder: settingsDialogLabels("anki.placeholder"),
              success: settingsDialogLabels("anki.success.syncCompleted"),
              error: settingsDialogLabels("anki.error.syncFailed"),
            },
          }}
        />
      </div>

      <DictionaryInput
        initialText={query ?? ""}
        i18n={{
          askAQuestionPlaceholder: dictionaryInputLabels(
            "askAQuestionPlaceholder"
          ),
        }}
      />

      {query && (
        <Suspense
          fallback={
            <Card className="mt-4">
              <CardHeader>
                <Skeleton className="h-4 w-2/3 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-5/6 mb-2" />
                <Skeleton className="h-3 w-4/5" />
              </CardContent>
            </Card>
          }
        >
          <ErrorBoundary
            fallback={
              <Card className="mt-4">
                <CardHeader>
                  <h3 className="text-red-600">
                    {errorBoundaryLabels("errorTitle")}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p>{errorBoundaryLabels("errorMessage")}</p>
                </CardContent>
              </Card>
            }
          >
            <DictionaryResult
              query={decodeURIComponent(query)}
              language={languageName}
            />
          </ErrorBoundary>
        </Suspense>
      )}
    </div>
  );
}
