"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function AppInitializer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const targetLang = searchParams.get("targetLang");
    const jpStyle = searchParams.get("jpStyle");

    if (!targetLang || (targetLang === "ja" && !jpStyle)) {
      const localTargetLang =
        localStorage.getItem("dictionaryTargetLanguage") ?? "auto";
      const localJPStyle =
        localStorage.getItem("japanesePronunciationStyle") ?? "romaji";

      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("targetLang", localTargetLang);

      if (localTargetLang === "ja" && !jpStyle) {
        newParams.set("jpStyle", localJPStyle);
      }

      router.replace(`${pathname}?${newParams.toString()}`);
    }
  }, [pathname, router, searchParams]);

  return null;
}
