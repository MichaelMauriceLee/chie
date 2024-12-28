"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import {
  initializeDeckNamesAtom,
  initializeSelectedDeckAtom,
  initializeThemeAtom,
} from "@/store/atoms";

export default function AppInitializer() {
  const hydrateDeckNames = useSetAtom(initializeDeckNamesAtom);
  const hydrateSelectedDeck = useSetAtom(initializeSelectedDeckAtom);
  const hydrateTheme = useSetAtom(initializeThemeAtom);

  useEffect(() => {
    hydrateDeckNames();
    hydrateSelectedDeck();
    hydrateTheme();
  }, [hydrateDeckNames, hydrateSelectedDeck, hydrateTheme]);

  return null;
}
