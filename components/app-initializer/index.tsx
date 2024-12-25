"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import {
  initializeDeckNamesAtom,
  initializeSelectedDeckAtom,
} from "@/store/atoms";

export default function AppInitializer() {
  const hydrateDeckNames = useSetAtom(initializeDeckNamesAtom);
  const hydrateSelectedDeck = useSetAtom(initializeSelectedDeckAtom);

  useEffect(() => {
    hydrateDeckNames();
    hydrateSelectedDeck();
  }, [hydrateDeckNames, hydrateSelectedDeck]);

  return null;
}
