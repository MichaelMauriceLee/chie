import { useEffect, useState, useCallback } from "react";
import { OCRBlock } from "@/models/serverActions";
import { analyzeImage } from "@/app/[locale]/actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useOCRAnalysis(image: string) {
  const t = useTranslations("ImageDisplay");
  const [isLoading, setIsLoading] = useState(false);
  const [imageSearchResult, setImageSearchResult] = useState<OCRBlock[] | null>(
    null
  );

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setImageSearchResult(null);

    try {
      const data = await analyzeImage(image);
      setImageSearchResult(data.readResult.blocks);
    } catch (err: unknown) {
      const resolvedError =
        err instanceof Error ? err : new Error("Unknown error occurred.");
      toast.error(`${t("error.message")}: ${resolvedError.message}`, {
        position: "top-center",
      });
      console.error(resolvedError);
    } finally {
      setIsLoading(false);
    }
  }, [image, t]);

  useEffect(() => {
    if (image) {
      void fetchAnalysis();
    }
  }, [image, fetchAnalysis]);

  return {
    isLoading,
    imageSearchResult,
    refresh: fetchAnalysis,
  };
}
