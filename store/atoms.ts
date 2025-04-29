import { atom } from "jotai";

export const themeAtom = atom<"light" | "dark">("light");

export const deckNamesAtom = atom<string[]>([]);

export const selectedDeckAtom = atom<string>("");

export enum WordSelectionMode {
  Override = "override",
  Add = "add",
}

export const wordSelectionModeAtom = atom<WordSelectionMode>(
  WordSelectionMode.Add
);

export const initializeThemeAtom = atom(
  (get) => get(themeAtom),
  (_get, set) => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as "light" | "dark";
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      const theme = storedTheme || (prefersDark ? "dark" : "light");
      set(themeAtom, theme);
    }
  }
);

export const initializeDeckNamesAtom = atom(
  (get) => get(deckNamesAtom),
  (_get, set) => {
    if (typeof window !== "undefined") {
      const storedDeckNames = JSON.parse(
        localStorage.getItem("deckNames") ?? "[]"
      );
      set(deckNamesAtom, storedDeckNames);
    }
  }
);

export const initializeSelectedDeckAtom = atom(
  (get) => get(selectedDeckAtom),
  (_get, set) => {
    if (typeof window !== "undefined") {
      const storedSelectedDeck = localStorage.getItem("selectedDeck") ?? "";
      set(selectedDeckAtom, storedSelectedDeck);
    }
  }
);

export const initializeWordSelectionModeAtom = atom(
  (get) => get(wordSelectionModeAtom),
  (_get, set) => {
    if (typeof window !== "undefined") {
      const storedMode = localStorage.getItem(
        "wordSelectionMode"
      ) as WordSelectionMode;
      const mode = storedMode || WordSelectionMode.Add;
      set(wordSelectionModeAtom, mode);
    }
  }
);
