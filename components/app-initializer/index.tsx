"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSetAtom } from "jotai";
import { 
  initializeWordSelectionModeAtom,
  initializeThemeAtom,
  initializeDeckNamesAtom,
  initializeSelectedDeckAtom
} from "@/store/atoms";

export default function AppInitializer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializeWordSelectionMode = useSetAtom(initializeWordSelectionModeAtom);
  const initializeTheme = useSetAtom(initializeThemeAtom);
  const initializeDeckNames = useSetAtom(initializeDeckNamesAtom);
  const initializeSelectedDeck = useSetAtom(initializeSelectedDeckAtom);

  useEffect(() => {
    initializeWordSelectionMode();
    initializeTheme();
    initializeDeckNames();
    initializeSelectedDeck();
  }, [initializeWordSelectionMode, initializeTheme, initializeDeckNames, initializeSelectedDeck]);

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
