import { atom } from "jotai";

function getInitialTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (storedTheme) return storedTheme;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  }

  return "light"; 
}

export const themeAtom = atom<"light" | "dark">(getInitialTheme());

export const deckNamesAtom = atom<string[]>([]);

export const selectedDeckAtom = atom<string>("");

export const initializeDeckNamesAtom = atom(
  (get) => get(deckNamesAtom),
  (_get, set) => {
    const storedDeckNames = JSON.parse(
      localStorage.getItem("deckNames") || "[]"
    );
    set(deckNamesAtom, storedDeckNames);
  }
);

export const initializeSelectedDeckAtom = atom(
  (get) => get(selectedDeckAtom),
  (_get, set) => {
    const storedSelectedDeck = localStorage.getItem("selectedDeck") || "";
    set(selectedDeckAtom, storedSelectedDeck);
  }
);
