import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!image) return;

    const fetchAnalysis = async () => {
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
    };

    void fetchAnalysis();
  }, [image, t]);

  const refresh = async () => {
    if (!image) return;
    
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
  };

  return {
    isLoading,
    imageSearchResult,
    refresh,
  };
}
