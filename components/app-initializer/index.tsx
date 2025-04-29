"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import {
  initializeDeckNamesAtom,
  initializeSelectedDeckAtom,
  initializeThemeAtom,
  initializeWordSelectionModeAtom,
} from "@/store/atoms";

export default function AppInitializer() {
  const hydrateDeckNames = useSetAtom(initializeDeckNamesAtom);
  const hydrateSelectedDeck = useSetAtom(initializeSelectedDeckAtom);
  const hydrateTheme = useSetAtom(initializeThemeAtom);
  const hydrateWordSelectionMode = useSetAtom(initializeWordSelectionModeAtom);

  useEffect(() => {
    hydrateDeckNames();
    hydrateSelectedDeck();
    hydrateTheme();
    hydrateWordSelectionMode();
  }, [
    hydrateDeckNames,
    hydrateSelectedDeck,
    hydrateTheme,
    hydrateWordSelectionMode,
  ]);

  return null;
}
