import { atom } from "jotai";

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
